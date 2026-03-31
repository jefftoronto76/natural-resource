'use client'

import { useState, useRef, useEffect } from 'react';

import { Sidebar } from '@/components/admin/layout/Sidebar';
import { AddBlockButton } from '@/components/admin/content/AddBlockButton';
import { Badge } from '@/components/admin/primitives/Badge';
import { Button } from '@/components/admin/primitives/Button';
import { Card } from '@/components/admin/primitives/Card';
import { Text } from '@/components/admin/primitives/Text';
import { SidebarSection } from '@/components/admin/navigation/SidebarSection';
import { SidebarItem } from '@/components/admin/navigation/SidebarItem';
import { tokens } from '@/components/admin/theme/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 8); }

const META = {
  guardrails: { title: 'Guardrails', desc: 'Hard rules — applied first, never overridden', label: 'Compiles 1st' },
  knowledge:  { title: 'Knowledge',  desc: 'What Sage knows — synthesized from your inputs', label: 'Compiles 2nd' },
  prompts:    { title: 'Prompts',    desc: 'Voice, behavior, conversion logic', label: 'Compiles 3rd' },
};

const INIT = {
  guardrails: { topics: [
    { id: 'g1', name: 'Do Not Engage', open: true, blocks: [
      { id: 'g1b1', name: 'Off-limit topics', type: 'text', content: 'Do not engage with requests for legal, financial, or medical advice. No free consulting. No abusive or off-brand exchanges.' },
    ]},
    { id: 'g2', name: 'Hard Limits', open: true, blocks: [
      { id: 'g2b1', name: 'Price & promise rules', type: 'text', content: 'Never promise specific outcomes. Only quote $250 working session or free discovery call. Never mention competitors.' },
    ]},
  ]},
  knowledge: { topics: [
    { id: 'k1', name: 'Background', open: true, blocks: [
      { id: 'k1b1', name: 'Career summary', type: 'doc', content: 'Jeff Lougheed is a revenue and operations leader with 20+ years experience across Trapeze, Infor, Keyhole, and Meal Garden (9× ARR growth).' },
      { id: 'k1b2', name: 'jefflougheed.ca', type: 'url', content: 'Synthesized from website — positioning, services, social proof. Last fetched March 29, 2026.' },
    ]},
    { id: 'k2', name: 'Services & Pricing', open: true, blocks: [
      { id: 'k2b1', name: 'Service lanes', type: 'wizard', content: 'Two lanes: 1-on-1 Coaching and Embedded Execution. C$250 / 60-min session. Free 15-min discovery call available.' },
    ]},
  ]},
  prompts: { topics: [
    { id: 'p1', name: 'Identity & Voice', open: true, blocks: [
      { id: 'p1b1', name: 'Who Sage is', type: 'wizard', content: "You are Sage, Jeff Lougheed's AI assistant on jefflougheed.ca. Your tone is direct, warm, and confident. No corporate language. Speak like a trusted advisor, not a sales bot." },
    ]},
    { id: 'p2', name: 'Conversion', open: true, blocks: [
      { id: 'p2b1', name: 'Conversion logic', type: 'wizard', content: 'Monitor for intent signals — project description, budget mention, follow-up questions, 6+ exchanges. When present, naturally introduce the booking CTA. Never force it.' },
    ]},
  ]},
};

async function callClaude(messages: {role: string, content: string}[], system: string): Promise<string> {
  const r = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  });
  const d = await r.json();
  return d.text || '';
}

const BLOCK_TYPE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  text: 'default',
  doc: 'success',
  url: 'default',
  wizard: 'warning',
};

const ADD_OPTIONS = [
  { type: 'write',  icon: '✏️', label: 'Write it',   desc: 'Type directly' },
  { type: 'wizard', icon: '✦',  label: 'AI wizard',  desc: 'Guided Q&A' },
  { type: 'url',    icon: '🔗', label: 'Paste URL',  desc: 'Auto-synthesize' },
  { type: 'doc',    icon: '📄', label: 'Upload doc', desc: 'PDF, Word, image' },
];

// Token shortcuts
const L = tokens.themes.light;
const D = tokens.themes.dark;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: tokens.radius.lg,
  border: `1px solid ${L.color.border.subtle}`,
  background: L.color.surface.canvas,
  fontSize: '13px',
  color: L.color.text.primary,
  outline: 'none',
  boxSizing: 'border-box',
};

// ─── TopicCard ────────────────────────────────────────────────────────────────

function TopicCard({ topic, topicAddMode, onToggle, onDelete, onDeleteBlock, onAddBlock, onSaveWrite, onCancelAdd, onAddUrl }: any) {
  const [showMenu, setShowMenu] = useState(false);
  const [writeForm, setWriteForm] = useState({ name: '', content: '' });
  const [urlVal, setUrlVal] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  async function handleUrl() {
    if (!urlVal.trim() || urlLoading) return;
    setUrlLoading(true);
    await onAddUrl(topic.id, urlVal.trim());
    setUrlVal('');
    setUrlLoading(false);
  }

  return (
    <Card variant="outlined" className="flex flex-col overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex cursor-pointer select-none items-center gap-2 px-4 py-3"
        style={{ background: topic.open ? L.color.surface.panel : L.color.surface.canvas }}
      >
        <span style={{
          fontSize: '10px',
          color: L.color.text.muted,
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: topic.open ? 'rotate(90deg)' : 'none',
        }}>▶</span>
        <Text variant="label" className="flex-1">{topic.name}</Text>
        <Text variant="muted" style={{ fontSize: '11px', marginRight: '4px' }}>
          {topic.blocks.length} block{topic.blocks.length !== 1 ? 's' : ''}
        </Text>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: L.color.text.muted, fontSize: '16px', lineHeight: 1, padding: '0 2px', opacity: 0.5 }}
        >×</button>
      </div>

      {topic.open && (
        <div
          className="flex flex-col gap-2 px-4 py-3"
          style={{ borderTop: `1px solid ${L.color.border.subtle}` }}
        >
          {/* Block rows */}
          {topic.blocks.map((block: any) => (
            <div
              key={block.id}
              className="flex items-start gap-3 rounded-lg px-3 py-2"
              style={{ border: `1px solid ${L.color.border.subtle}`, background: L.color.surface.canvas }}
            >
              <div style={{ paddingTop: '1px', flexShrink: 0 }}>
                <Badge variant={BLOCK_TYPE_VARIANT[block.type] ?? 'default'} size="sm">
                  {block.type}
                </Badge>
              </div>
              <div className="min-w-0 flex-1">
                <Text variant="label" style={{ marginBottom: '2px' }}>{block.name}</Text>
                <Text
                  variant="muted"
                  style={{ fontSize: '12px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}
                >
                  {block.content}
                </Text>
              </div>
              <button
                onClick={() => onDeleteBlock(block.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: L.color.text.muted, fontSize: '14px', flexShrink: 0, lineHeight: 1, opacity: 0.5, padding: '1px 2px' }}
              >×</button>
            </div>
          ))}

          {/* Write form */}
          {topicAddMode === 'write' && (
            <div
              className="flex flex-col gap-2 rounded-lg p-3"
              style={{ border: `1px solid ${L.color.border.subtle}`, background: L.color.surface.panel }}
            >
              <input
                autoFocus
                placeholder="Block name..."
                value={writeForm.name}
                onChange={e => setWriteForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="Block content..."
                value={writeForm.content}
                onChange={e => setWriteForm(f => ({ ...f, content: e.target.value }))}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.5' }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => { onSaveWrite(topic.id, writeForm.name, writeForm.content); setWriteForm({ name: '', content: '' }); }}
                >
                  Save block
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { onCancelAdd(); setWriteForm({ name: '', content: '' }); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* URL form */}
          {topicAddMode === 'url' && (
            <div
              className="flex flex-col gap-2 rounded-lg p-3"
              style={{ border: `1px solid ${L.color.border.subtle}`, background: L.color.surface.panel }}
            >
              <Text variant="muted" style={{ fontSize: '11px' }}>
                Paste a URL — AI synthesizes it into a knowledge block
              </Text>
              <input
                autoFocus
                placeholder="https://..."
                value={urlVal}
                onChange={e => setUrlVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleUrl(); }}
                style={inputStyle}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleUrl}
                  disabled={urlLoading || !urlVal.trim()}
                >
                  {urlLoading ? 'Synthesizing...' : 'Synthesize'}
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelAdd}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Add block menu */}
          {topicAddMode === null && (
            <div className="flex flex-col gap-2">
              <AddBlockButton
                onClick={() => setShowMenu(v => !v)}
                label={showMenu ? '× Close' : '+ Add block'}
              />
              {showMenu && (
                <div className="grid grid-cols-2 gap-2">
                  {ADD_OPTIONS.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setShowMenu(false); onAddBlock(opt.type); }}
                      className="flex cursor-pointer flex-col items-start gap-1 rounded-lg p-3 text-left"
                      style={{ border: `1px solid ${L.color.border.subtle}`, background: L.color.surface.panel }}
                    >
                      <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                      <Text variant="label">{opt.label}</Text>
                      <Text variant="muted" style={{ fontSize: '11px' }}>{opt.desc}</Text>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── WizardDrawer ─────────────────────────────────────────────────────────────

function WizardDrawer({ wizard, onClose, onUpdateInput, onSend, onConfirm }: any) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [wizard.messages.length, wizard.loading]);

  const displayMessages = wizard.messages.slice(1);

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: '380px',
      background: D.color.surface.canvas,
      borderLeft: `1px solid ${D.color.border.subtle}`,
      display: 'flex', flexDirection: 'column', zIndex: 30,
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${D.color.border.subtle}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <Text variant="label" style={{ color: D.color.text.primary }}>Block Wizard</Text>
          <Text variant="muted" style={{ color: D.color.text.muted, marginTop: '1px', fontSize: '11px' }}>
            AI-assisted block creation
          </Text>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: D.color.text.muted, fontSize: '20px', lineHeight: 1, padding: '2px 6px' }}
        >×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {wizard.initialLoading && (
          <Text variant="muted" style={{ color: D.color.text.muted, fontSize: '13px' }}>Setting up...</Text>
        )}

        {displayMessages.map((msg: any, i: number) => {
          const isDoneJson = msg.role === 'assistant' && msg.content.trim().startsWith('{');
          return (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '88%', padding: '9px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? 'var(--color-accent)' : D.color.surface.panel,
                color: msg.role === 'user' ? '#fff' : (isDoneJson ? D.color.text.muted : D.color.text.primary),
                fontSize: '13px', lineHeight: '1.5',
                fontStyle: isDoneJson ? 'italic' : 'normal',
              }}>
                {isDoneJson ? 'Generating your block...' : msg.content}
              </div>
            </div>
          );
        })}

        {wizard.loading && (
          <div style={{ display: 'flex' }}>
            <div style={{
              padding: '9px 12px', borderRadius: '12px 12px 12px 4px',
              background: D.color.surface.panel, fontSize: '13px', color: D.color.text.muted,
            }}>
              Thinking...
            </div>
          </div>
        )}

        {wizard.generated && (
          <div style={{
            border: '1px solid var(--color-accent)',
            borderRadius: tokens.radius.xl,
            padding: '12px',
            background: 'rgba(45,106,79,0.12)',
          }}>
            <Text variant="muted" style={{
              fontSize: '10px', fontWeight: 500, color: 'var(--color-accent)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px',
            }}>
              Block ready
            </Text>
            <Text variant="label" style={{ color: D.color.text.primary, marginBottom: '6px', display: 'block' }}>
              {wizard.generated.blockName}
            </Text>
            <div style={{
              fontSize: '12px', color: D.color.text.muted, lineHeight: '1.6',
              background: D.color.surface.canvas,
              padding: '8px 10px', borderRadius: tokens.radius.lg,
              fontFamily: 'var(--font-mono)',
            }}>
              {wizard.generated.content}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className="mt-3 w-full"
            >
              Add this block →
            </Button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {!wizard.generated && !wizard.initialLoading && (
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${D.color.border.subtle}`,
          display: 'flex', gap: '8px', flexShrink: 0,
        }}>
          <input
            value={wizard.input}
            onChange={e => onUpdateInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) onSend(); }}
            placeholder="Type your answer..."
            disabled={wizard.loading}
            style={{
              flex: 1, padding: '8px 12px',
              borderRadius: tokens.radius.lg,
              border: `1px solid ${D.color.border.subtle}`,
              background: D.color.surface.panel,
              fontSize: '13px', color: D.color.text.primary, outline: 'none',
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={onSend}
            disabled={wizard.loading || !wizard.input.trim()}
          >
            →
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── PreviewModal ─────────────────────────────────────────────────────────────

function PreviewModal({ content, onClose }: { content: string, onClose: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '24px',
    }}>
      <div style={{
        background: L.color.surface.canvas,
        borderRadius: tokens.radius.xl,
        border: `1px solid ${L.color.border.subtle}`,
        width: '100%', maxWidth: '580px', maxHeight: '500px',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${L.color.border.subtle}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <Text variant="label">Compiled system prompt</Text>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: L.color.text.muted, fontSize: '20px', lineHeight: 1 }}
          >×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <pre style={{
            fontSize: '12px', color: L.color.text.muted,
            lineHeight: '1.8', whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-mono)', margin: 0,
          }}>{content}</pre>
        </div>
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${L.color.border.subtle}`,
          display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0,
        }}>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          <Button variant="primary" size="sm">Activate ↗</Button>
        </div>
      </div>
    </div>
  );
}

// ─── PromptBuilder ────────────────────────────────────────────────────────────

export default function PromptBuilder() {
  const [canvas, setCanvas] = useState('prompts');
  const [data, setData] = useState(INIT);
  const [addMode, setAddMode] = useState<{ topicId: string, type: string } | null>(null);
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [wizard, setWizard] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const meta = META[canvas as keyof typeof META];
  const topics = data[canvas as keyof typeof data].topics;

  function update(fn: (ts: any[]) => any[]) {
    setData(d => ({ ...d, [canvas]: { ...d[canvas as keyof typeof d], topics: fn(d[canvas as keyof typeof d].topics) } }));
  }

  function toggleTopic(id: string) { update(ts => ts.map(t => t.id === id ? { ...t, open: !t.open } : t)); }
  function deleteTopic(id: string) { update(ts => ts.filter(t => t.id !== id)); if (addMode?.topicId === id) setAddMode(null); }
  function deleteBlock(tid: string, bid: string) { update(ts => ts.map(t => t.id === tid ? { ...t, blocks: t.blocks.filter((b: any) => b.id !== bid) } : t)); }

  function addTopic() {
    if (!newTopicName.trim()) return;
    update(ts => [...ts, { id: uid(), name: newTopicName.trim(), open: true, blocks: [] }]);
    setNewTopicName(''); setNewTopicMode(false);
  }

  function saveWriteBlock(tid: string, name: string, content: string) {
    if (!name.trim() || !content.trim()) return;
    update(ts => ts.map(t => t.id === tid ? { ...t, blocks: [...t.blocks, { id: uid(), name: name.trim(), type: 'text', content: content.trim() }] } : t));
    setAddMode(null);
  }

  async function addUrlBlock(tid: string, url: string) {
    const topic = topics.find((t: any) => t.id === tid);
    if (!topic) return;
    const sys = `You synthesize URLs into knowledge blocks for an AI assistant. Return ONLY valid JSON, no other text: {"blockName":"...","content":"..."} Keep content under 150 words, clear and factual.`;
    const reply = await callClaude([{ role: 'user', content: `Synthesize this URL for the "${topic.name}" topic: ${url}` }], sys);
    let block;
    try {
      const p = JSON.parse(reply.trim());
      block = { id: uid(), name: p.blockName || url, type: 'url', content: p.content };
    } catch {
      block = { id: uid(), name: url, type: 'url', content: reply };
    }
    update(ts => ts.map(t => t.id === tid ? { ...t, blocks: [...t.blocks, block] } : t));
    setAddMode(null);
  }

  function handleAddBlock(tid: string, type: string) {
    if (type === 'wizard') openWizard(tid);
    else if (type === 'doc') alert('Document upload requires backend integration. Coming in the Next.js build.');
    else setAddMode({ topicId: tid, type });
  }

  async function openWizard(tid: string) {
    const topic = topics.find((t: any) => t.id === tid);
    if (!topic) return;
    const sys = `You are a setup assistant helping configure the Sage AI assistant.
Canvas: ${meta.title} — ${meta.desc}
Topic: ${topic.name}

Ask 2-3 short, focused questions to understand what should go in this block. Once you have enough, synthesize it.
When ready, respond ONLY with this JSON on one line (no other text):
{"done":true,"blockName":"[short name]","content":"[content, max 120 words]"}

Be concise and direct. Professional tone.`;

    setWizard({ topicId: tid, sys, messages: [], input: '', loading: false, initialLoading: true, generated: null });

    const first = await callClaude([
      { role: 'user', content: `Adding a block to "${topic.name}" in ${meta.title}.` }
    ], sys);

    setWizard((w: any) => w ? {
      ...w,
      messages: [
        { role: 'user', content: `Adding a block to "${topic.name}" in ${meta.title}.` },
        { role: 'assistant', content: first },
      ],
      initialLoading: false,
    } : null);
  }

  async function sendWizardMessage() {
    if (!wizard?.input.trim() || wizard.loading) return;
    const msg = wizard.input.trim();
    const msgs = [...wizard.messages, { role: 'user', content: msg }];
    setWizard((w: any) => ({ ...w, messages: msgs, input: '', loading: true }));

    const reply = await callClaude(msgs, wizard.sys);

    let generated = null;
    try {
      const match = reply.match(/\{[\s\S]*?"done"[\s\S]*?\}/);
      if (match) {
        const p = JSON.parse(match[0]);
        if (p.done) generated = { blockName: p.blockName, content: p.content };
      }
    } catch {}

    setWizard((w: any) => w ? { ...w, messages: [...msgs, { role: 'assistant', content: reply }], loading: false, generated } : null);
  }

  function confirmWizardBlock() {
    if (!wizard?.generated) return;
    const { topicId, generated } = wizard;
    update(ts => ts.map(t => t.id === topicId
      ? { ...t, blocks: [...t.blocks, { id: uid(), name: generated.blockName, type: 'wizard', content: generated.content }] }
      : t
    ));
    setWizard(null);
  }

  function openPreview() {
    let compiled = '';
    for (const key of ['guardrails', 'knowledge', 'prompts']) {
      const m = META[key as keyof typeof META];
      compiled += `## ${m.title.toUpperCase()}\n\n`;
      for (const t of data[key as keyof typeof data].topics) {
        compiled += `### ${t.name}\n`;
        for (const b of t.blocks) compiled += `${b.content}\n\n`;
      }
    }
    setPreview(compiled);
  }

  const blockCount = (k: string) => data[k as keyof typeof data].topics.reduce((a: number, t: any) => a + t.blocks.length, 0);

  const sidebarHeader = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Text variant="label" style={{ color: D.color.text.primary, fontFamily: 'var(--font-display)', fontSize: '15px' }}>
        Sage
      </Text>
      <Text variant="muted" style={{ color: D.color.text.muted, fontSize: '11px' }}>
        Prompt Builder
      </Text>
    </div>
  );

  const previewButton = (
    <button
      onClick={openPreview}
      style={{
        width: '100%',
        padding: '10px',
        borderRadius: tokens.radius.lg,
        border: '1px solid var(--color-accent)',
        background: 'transparent',
        color: 'var(--color-accent)',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.02em',
      }}
    >
      Preview compiled ↗
    </button>
  );

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Desktop layout (md+) ────────────────────────────────────────────── */}
      <div className="relative hidden h-full w-full overflow-hidden md:flex">
        {/* Canvas nav sidebar */}
        <Sidebar header={sidebarHeader} footer={previewButton}>
          <SidebarSection label="Canvases">
            {(['guardrails', 'knowledge', 'prompts'] as const).map(key => (
              <SidebarItem
                key={key}
                label={`${META[key].title} · ${blockCount(key)}`}
                isActive={canvas === key}
                onClick={() => { setCanvas(key); setWizard(null); setAddMode(null); setNewTopicMode(false); }}
              />
            ))}
          </SidebarSection>
        </Sidebar>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Canvas header */}
          <div
            className="flex shrink-0 items-center justify-between px-5 py-4"
            style={{
              borderBottom: `1px solid ${L.color.border.subtle}`,
              background: L.color.surface.canvas,
            }}
          >
            <div>
              <Text variant="title">{meta.title}</Text>
              <Text variant="muted" style={{ marginTop: '2px', fontSize: '12px' }}>{meta.desc}</Text>
            </div>
            <Badge variant="default" size="sm">{meta.label}</Badge>
          </div>

          {/* Scrollable topic list */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-5"
            style={{ background: L.color.surface.panel }}
          >
            {topics.map((topic: any) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                topicAddMode={addMode?.topicId === topic.id ? addMode!.type : null}
                onToggle={() => toggleTopic(topic.id)}
                onDelete={() => deleteTopic(topic.id)}
                onDeleteBlock={(bid: string) => deleteBlock(topic.id, bid)}
                onAddBlock={(type: string) => handleAddBlock(topic.id, type)}
                onSaveWrite={saveWriteBlock}
                onCancelAdd={() => setAddMode(null)}
                onAddUrl={addUrlBlock}
              />
            ))}

            {newTopicMode ? (
              <div
                className="flex flex-col gap-3 rounded-xl p-3"
                style={{
                  border: `1px solid ${L.color.border.subtle}`,
                  background: L.color.surface.canvas,
                }}
              >
                <input
                  autoFocus
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addTopic();
                    if (e.key === 'Escape') { setNewTopicMode(false); setNewTopicName(''); }
                  }}
                  placeholder="Topic name (e.g. Ideal Client, Philosophy, Pricing)..."
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={addTopic}>Add topic</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setNewTopicMode(false); setNewTopicName(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setNewTopicMode(true)}
                className="w-full cursor-pointer rounded-xl py-3 text-sm"
                style={{
                  border: `1px dashed ${L.color.border.subtle}`,
                  background: 'transparent',
                  color: L.color.text.muted,
                }}
              >
                + Add topic
              </button>
            )}
          </div>
        </div>

        {wizard && (
          <WizardDrawer
            wizard={wizard}
            onClose={() => setWizard(null)}
            onUpdateInput={(v: string) => setWizard((w: any) => ({ ...w, input: v }))}
            onSend={sendWizardMessage}
            onConfirm={confirmWizardBlock}
          />
        )}

        {preview !== null && (
          <PreviewModal content={preview} onClose={() => setPreview(null)} />
        )}
      </div>

      {/* ── Mobile layout (below md) ────────────────────────────────────────── */}
      <div className="flex h-full w-full flex-col md:hidden" style={{ background: D.color.surface.canvas }}>

        {/* Mobile header */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${D.color.border.subtle}`, background: D.color.surface.panel }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <Text variant="label" style={{ color: D.color.text.primary, fontFamily: 'var(--font-display)', fontSize: '15px' }}>
              Sage
            </Text>
            <Text variant="muted" style={{ color: D.color.text.muted, fontSize: '11px' }}>
              Prompt Builder
            </Text>
          </div>
          <button
            onClick={openPreview}
            style={{
              padding: '5px 12px',
              borderRadius: tokens.radius.lg,
              border: '1px solid var(--color-accent)',
              background: 'transparent',
              color: 'var(--color-accent)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Preview ↗
          </button>
        </div>

        {/* Scrollable body — Steps 4–6 */}
        <div className="flex flex-1 flex-col overflow-y-auto" style={{ background: D.color.surface.canvas }} />

        {/* Bottom tab bar */}
        <div
          className="flex shrink-0"
          style={{
            borderTop: `1px solid ${D.color.border.subtle}`,
            background: D.color.surface.panel,
          }}
        >
          {(['guardrails', 'knowledge', 'prompts'] as const).map(key => {
            const isActive = canvas === key;
            return (
              <button
                key={key}
                onClick={() => { setCanvas(key); setWizard(null); setAddMode(null); setNewTopicMode(false); }}
                style={{
                  flex: 1,
                  padding: '10px 4px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderTop: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                  color: isActive ? 'var(--color-accent)' : D.color.text.muted,
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.03em',
                  transition: 'color 0.15s',
                }}
              >
                {META[key].title}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
