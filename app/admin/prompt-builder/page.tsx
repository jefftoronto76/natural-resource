'use client'

import { useState, useRef, useEffect } from "react";

const G = '#2d6a4f';
const GL = 'rgba(45,106,79,0.08)';

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

function Badge({ type }: { type: string }) {
  const map: Record<string, { bg: string, c: string }> = {
    text:   { bg: 'var(--color-background-secondary)', c: 'var(--color-text-secondary)' },
    doc:    { bg: 'rgba(45,106,79,0.1)', c: G },
    url:    { bg: 'rgba(23,91,161,0.08)', c: '#175ba1' },
    wizard: { bg: 'rgba(120,60,180,0.08)', c: '#783cb4' },
  };
  const s = map[type] || map.text;
  return (
    <span style={{ fontSize: '10px', fontWeight: 500, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em', textTransform: 'uppercase', background: s.bg, color: s.c, flexShrink: 0, whiteSpace: 'nowrap' }}>
      {type}
    </span>
  );
}

const ADD_OPTIONS = [
  { type: 'write',  icon: '✏️', label: 'Write it',     desc: 'Type directly' },
  { type: 'wizard', icon: '✦',  label: 'AI wizard',    desc: 'Guided Q&A' },
  { type: 'url',    icon: '🔗', label: 'Paste URL',    desc: 'Auto-synthesize' },
  { type: 'doc',    icon: '📄', label: 'Upload doc',   desc: 'PDF, Word, image' },
];

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

  const blockBorder = '0.5px solid var(--color-border-tertiary)';
  const inputStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ border: blockBorder, borderRadius: '10px', background: 'var(--color-background-primary)' }}>
      <div onClick={onToggle} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'inline-block', transition: 'transform 0.15s', transform: topic.open ? 'rotate(90deg)' : 'none' }}>▶</span>
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{topic.name}</span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginRight: '4px' }}>{topic.blocks.length} block{topic.blocks.length !== 1 ? 's' : ''}</span>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: 1, padding: '0 2px', opacity: 0.5 }}>×</button>
      </div>

      {topic.open && (
        <div style={{ borderTop: blockBorder, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topic.blocks.map((block: any) => (
            <div key={block.id} style={{ border: blockBorder, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ paddingTop: '1px' }}><Badge type={block.type} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '3px' }}>{block.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{block.content}</div>
              </div>
              <button onClick={() => onDeleteBlock(block.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '14px', flexShrink: 0, lineHeight: 1, opacity: 0.5, padding: '1px 2px' }}>×</button>
            </div>
          ))}

          {topicAddMode === 'write' && (
            <div style={{ border: '0.5px solid var(--color-border-secondary)', borderRadius: '8px', padding: '10px', background: 'var(--color-background-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input autoFocus placeholder="Block name..." value={writeForm.name}
                onChange={e => setWriteForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle} />
              <textarea placeholder="Block content..." value={writeForm.content}
                onChange={e => setWriteForm(f => ({ ...f, content: e.target.value }))} rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.5' }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => { onSaveWrite(topic.id, writeForm.name, writeForm.content); setWriteForm({ name: '', content: '' }); }}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: G, color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Save block</button>
                <button onClick={() => { onCancelAdd(); setWriteForm({ name: '', content: '' }); }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {topicAddMode === 'url' && (
            <div style={{ border: '0.5px solid var(--color-border-secondary)', borderRadius: '8px', padding: '10px', background: 'var(--color-background-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Paste a URL — AI synthesizes it into a knowledge block</div>
              <input autoFocus placeholder="https://..." value={urlVal}
                onChange={e => setUrlVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleUrl(); }}
                style={inputStyle} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleUrl} disabled={urlLoading || !urlVal.trim()}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: (urlLoading || !urlVal.trim()) ? 'var(--color-background-secondary)' : G, color: (urlLoading || !urlVal.trim()) ? 'var(--color-text-secondary)' : 'white', fontSize: '12px', cursor: (urlLoading || !urlVal.trim()) ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
                  {urlLoading ? 'Synthesizing...' : 'Synthesize'}
                </button>
                <button onClick={onCancelAdd}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {topicAddMode === null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => setShowMenu(v => !v)}
                style={{ width: '100%', padding: '8px', border: `0.5px dashed ${showMenu ? G : 'var(--color-border-secondary)'}`, borderRadius: '8px', background: showMenu ? GL : 'transparent', color: showMenu ? G : 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                {showMenu ? '× Close' : '+ Add block'}
              </button>
              {showMenu && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {ADD_OPTIONS.map(opt => (
                    <button key={opt.type}
                      onClick={() => { setShowMenu(false); onAddBlock(opt.type); }}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{opt.label}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WizardDrawer({ wizard, onClose, onUpdateInput, onSend, onConfirm }: any) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [wizard.messages.length, wizard.loading]);

  const displayMessages = wizard.messages.slice(1);

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '380px', background: 'var(--color-background-primary)', borderLeft: '0.5px solid var(--color-border-tertiary)', display: 'flex', flexDirection: 'column', zIndex: 30 }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Block Wizard</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>AI-assisted block creation</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '20px', lineHeight: 1, padding: '2px 6px' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {wizard.initialLoading && (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Setting up...</div>
        )}

        {displayMessages.map((msg: any, i: number) => {
          const isDoneJson = msg.role === 'assistant' && msg.content.trim().startsWith('{');
          return (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '88%', padding: '9px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? G : 'var(--color-background-secondary)',
                color: msg.role === 'user' ? 'white' : (isDoneJson ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'),
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
            <div style={{ padding: '9px 12px', borderRadius: '12px 12px 12px 4px', background: 'var(--color-background-secondary)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Thinking...
            </div>
          </div>
        )}

        {wizard.generated && (
          <div style={{ border: `0.5px solid ${G}`, borderRadius: '10px', padding: '12px', background: GL }}>
            <div style={{ fontSize: '10px', fontWeight: 500, color: G, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Block ready</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{wizard.generated.blockName}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.6', background: 'var(--color-background-primary)', padding: '8px 10px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
              {wizard.generated.content}
            </div>
            <button onClick={onConfirm}
              style={{ marginTop: '10px', width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: G, color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Add this block →
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {!wizard.generated && !wizard.initialLoading && (
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <input value={wizard.input}
            onChange={e => onUpdateInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) onSend(); }}
            placeholder="Type your answer..."
            disabled={wizard.loading}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none' }} />
          <button onClick={onSend} disabled={wizard.loading || !wizard.input.trim()}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: (wizard.loading || !wizard.input.trim()) ? 'var(--color-background-secondary)' : G, color: (wizard.loading || !wizard.input.trim()) ? 'var(--color-text-secondary)' : 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
            →
          </button>
        </div>
      )}
    </div>
  );
}

function PreviewModal({ content, onClose }: { content: string, onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
      <div style={{ background: 'var(--color-background-primary)', borderRadius: '12px', border: '0.5px solid var(--color-border-tertiary)', width: '100%', maxWidth: '580px', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Compiled system prompt</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <pre style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', margin: 0 }}>{content}</pre>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>Close</button>
          <button style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: G, color: 'white', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>Activate ↗</button>
        </div>
      </div>
    </div>
  );
}

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

  const inputBase: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', display: 'flex', height: '640px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: 'var(--color-background-primary)' }}>

      {/* Sidebar */}
      <div style={{ width: '210px', borderRight: '0.5px solid var(--color-border-tertiary)', display: 'flex', flexDirection: 'column', background: 'var(--color-background-secondary)', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'Georgia, var(--font-serif), serif' }}>Sage</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Prompt Builder</div>
        </div>

        <div style={{ padding: '8px', flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 6px' }}>Canvases</div>
          {['guardrails', 'knowledge', 'prompts'].map(key => {
            const active = canvas === key;
            return (
              <button key={key}
                onClick={() => { setCanvas(key); setWizard(null); setAddMode(null); setNewTopicMode(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '8px', border: 'none', background: active ? 'var(--color-background-primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', marginBottom: '2px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? G : 'var(--color-border-secondary)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{META[key as keyof typeof META].title}</span>
                <span style={{ fontSize: '11px', padding: '1px 5px', borderRadius: '10px', background: active ? GL : 'transparent', color: active ? G : 'var(--color-text-secondary)' }}>
                  {blockCount(key)}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '12px' }}>
          <button onClick={openPreview}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `0.5px solid ${G}`, background: 'transparent', color: G, fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            Preview compiled ↗
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{meta.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{meta.desc}</div>
          </div>
          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: GL, color: G, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '12px' }}>
            {meta.label}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topics.map((topic: any) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              topicAddMode={addMode?.topicId === topic.id ? addMode.type : null}
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
            <div style={{ border: '0.5px solid var(--color-border-secondary)', borderRadius: '10px', padding: '12px', background: 'var(--color-background-secondary)' }}>
              <input autoFocus value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTopic(); if (e.key === 'Escape') { setNewTopicMode(false); setNewTopicName(''); } }}
                placeholder="Topic name (e.g. Ideal Client, Philosophy, Pricing)..."
                style={inputBase} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={addTopic}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: G, color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Add topic</button>
                <button onClick={() => { setNewTopicMode(false); setNewTopicName(''); }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewTopicMode(true)}
              style={{ padding: '10px', border: '0.5px dashed var(--color-border-secondary)', borderRadius: '10px', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
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
  );
}
