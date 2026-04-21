// Variation B — split view. Compact list on the left, live preview / edit pane on the right.
const { useState: useStateB, useMemo: useMemoB } = React;

function VariationB({ onCompile }) {
  const [blocks, setBlocks] = useStateB(BLOCKS);
  const [query, setQuery] = useStateB("");
  const [typeFilter, setTypeFilter] = useStateB("all");
  const [selectedId, setSelectedId] = useStateB(BLOCKS[5].id);

  const filtered = useMemoB(() => {
    return blocks
      .filter(b => !query || b.title.toLowerCase().includes(query.toLowerCase()))
      .filter(b => typeFilter === "all" || b.type === typeFilter)
      .sort((a, b) => a.order - b.order);
  }, [blocks, query, typeFilter]);

  const current = blocks.find(b => b.id === selectedId) || filtered[0];
  const toggleActive = (id) => setBlocks(blocks.map(b => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <>
      <PageHeader onCompile={onCompile} />
      <div style={{ padding: "var(--mantine-spacing-md) var(--mantine-spacing-xl) 0", marginBottom: 0 }}>
        <div className="paper" style={{ padding: "12px 16px" }}>
          <TokenMeter blocks={blocks} budget={TOKEN_BUDGET} />
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "420px 1fr", gap: 0, padding: "var(--mantine-spacing-md) var(--mantine-spacing-xl) var(--mantine-spacing-xl)", minHeight: 0 }}>
        {/* Left — list */}
        <div className="paper" style={{ display: "flex", flexDirection: "column", minHeight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: "none" }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="text-input text-input--with-icon">
              <span className="text-input__icon"><Icon name="search" /></span>
              <input className="text-input__input" placeholder="Search blocks…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[{ v: "all", l: "All" }, { v: "process", l: "Process" }, { v: "knowledge", l: "Knowledge" }, { v: "identity", l: "Identity" }].map(o => (
                <button key={o.v} onClick={() => setTypeFilter(o.v)} className="text-xs fw-500" style={{
                  padding: "4px 10px", height: 26, border: "1px solid var(--border-strong)",
                  borderRadius: 999, background: typeFilter === o.v ? "var(--mantine-color-blue-0)" : "var(--surface)",
                  color: typeFilter === o.v ? "var(--mantine-color-blue-8)" : "var(--text-muted)",
                  borderColor: typeFilter === o.v ? "var(--mantine-color-blue-4)" : "var(--border-strong)",
                  cursor: "pointer",
                }}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="scroll-area" style={{ flex: 1, overflow: "auto", padding: 6 }}>
            {filtered.map((b, i) => {
              const sel = b.id === current?.id;
              return (
                <button key={b.id} onClick={() => setSelectedId(b.id)} className={(!b.active ? "is-disabled " : "")}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 10px",
                    width: "100%", border: "none", textAlign: "left", cursor: "pointer",
                    background: sel ? "var(--primary-light)" : "transparent",
                    borderRadius: 6, marginBottom: 2,
                    color: "inherit",
                  }}>
                  <span className="text-mono text-xs text-dimmed" style={{ width: 20, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span className={"badge " + TYPES[b.type].badge} style={{ height: 16, fontSize: 9.5, padding: "0 6px" }}>{TYPES[b.type].label}</span>
                      {!b.active && <span className="badge badge--light-gray" style={{ height: 16, fontSize: 9.5, padding: "0 6px" }}>Off</span>}
                    </div>
                    <div className="fw-500 text-sm" style={{ lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{b.title}</div>
                    <div className="text-xs text-dimmed" style={{ marginTop: 4, display: "flex", gap: 8 }}>
                      <span className="text-mono">{b.tokens} tok</span>
                      <span>·</span>
                      <span>{b.updated}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid var(--border)" }}>
            <button className="btn btn--default btn--sm" style={{ width: "100%", justifyContent: "center" }}><Icon name="plus" size={14} /> New block</button>
          </div>
        </div>

        {/* Right — live preview */}
        {current && (
          <div className="paper" style={{ display: "flex", flexDirection: "column", minHeight: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span className={"badge " + TYPES[current.type].badge}>{TYPES[current.type].label}</span>
                  <span className="text-xs text-dimmed">·</span>
                  <span className="text-xs text-dimmed">Updated {current.updated} by {current.author}</span>
                </div>
                <div className="fw-600" style={{ fontSize: 18, letterSpacing: "-0.01em" }}>{current.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="switch">
                  <input type="checkbox" checked={current.active} onChange={() => toggleActive(current.id)} />
                  <span className="switch__track"><span className="switch__thumb" /></span>
                </label>
                <span className="text-xs text-dimmed" style={{ width: 50 }}>{current.active ? "Active" : "Disabled"}</span>
                <div style={{ width: 1, height: 22, background: "var(--border)" }} />
                <button className="action-icon" title="Duplicate"><Icon name="copy" /></button>
                <button className="action-icon action-icon--danger" title="Delete"><Icon name="trash" /></button>
              </div>
            </div>

            {/* Meta strip */}
            <div style={{ display: "flex", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-subtle)", gap: 28 }}>
              <Meta label="Tokens" value={<span className="text-mono fw-600" style={{ color: current.tokens > 1000 ? "var(--mantine-color-yellow-7)" : "var(--text)" }}>{current.tokens}</span>} />
              <Meta label="Order" value={<span className="text-mono">{String(blocks.filter(b => b.active).sort((a,b)=>a.order-b.order).findIndex(b=>b.id===current.id) + 1 || "—").padStart(2, "0")}</span>} />
              <Meta label="Budget share" value={<span className="text-mono">{((current.tokens / TOKEN_BUDGET) * 100).toFixed(1)}%</span>} />
              <Meta label="Author" value={current.author} />
            </div>

            {/* Content */}
            <div className="scroll-area" style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
              <div style={{ maxWidth: 720 }}>
                <div className="text-xs fw-600 text-dimmed" style={{ textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Content</div>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text)", whiteSpace: "pre-wrap", fontFamily: "var(--mantine-font-family-monospace)" }}>{current.preview}</div>

                <div className="text-xs fw-600 text-dimmed" style={{ textTransform: "uppercase", letterSpacing: "0.08em", margin: "28px 0 10px" }}>Usage in compiled prompt</div>
                <div style={{ background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontFamily: "var(--mantine-font-family-monospace)", fontSize: 12, color: "var(--text-dimmed)" }}>
                  <div>…previous block ends.</div>
                  <div style={{ background: "var(--mantine-color-yellow-4)", color: "var(--mantine-color-gray-9)", padding: "6px 8px", borderRadius: 4, margin: "8px 0" }}>
                    # {current.title}
                  </div>
                  <div style={{ color: "var(--text)" }}>{current.preview.slice(0, 180)}…</div>
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn--filled"><Icon name="edit" size={14} /> Edit content</button>
              <button className="btn btn--default"><Icon name="code" size={14} /> View raw</button>
              <span style={{ marginLeft: "auto" }} className="text-xs text-dimmed">
                <span className="kbd">↑</span> <span className="kbd">↓</span> to navigate · <span className="kbd">E</span> to edit
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Meta({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="text-xs text-dimmed" style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

Object.assign(window, { VariationB });
