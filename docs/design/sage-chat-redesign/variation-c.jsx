// Variation C — grouped stack. Collapsible groups by Type with cards inside.
const { useState: useStateC } = React;

function VariationC({ onCompile }) {
  const [blocks, setBlocks] = useStateC(BLOCKS);
  const [query, setQuery] = useStateC("");
  const [openGroups, setOpenGroups] = useStateC(new Set(["process", "knowledge", "identity"]));
  const [selected, setSelected] = useStateC(new Set());

  const toggleActive = (id) => setBlocks(blocks.map(b => b.id === id ? { ...b, active: !b.active } : b));
  const toggleGroup = (t) => {
    const s = new Set(openGroups);
    s.has(t) ? s.delete(t) : s.add(t);
    setOpenGroups(s);
  };
  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const filtered = blocks.filter(b => !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.preview.toLowerCase().includes(query.toLowerCase()));
  const groups = ["process", "knowledge", "identity"].map(t => ({
    type: t,
    items: filtered.filter(b => b.type === t).sort((a, b) => a.order - b.order),
    tokens: filtered.filter(b => b.type === t && b.active).reduce((s, b) => s + b.tokens, 0),
  }));

  const accent = {
    process: "var(--mantine-color-orange-6)",
    knowledge: "var(--mantine-color-teal-6)",
    identity: "var(--mantine-color-violet-6)",
  };

  return (
    <>
      <PageHeader onCompile={onCompile} />
      <div style={{ padding: "var(--mantine-spacing-lg) var(--mantine-spacing-xl)", display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
        <div className="paper" style={{ padding: "var(--mantine-spacing-md) var(--mantine-spacing-lg)" }}>
          <TokenMeter blocks={blocks} budget={TOKEN_BUDGET} />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="text-input text-input--with-icon" style={{ flex: "0 0 360px" }}>
            <span className="text-input__icon"><Icon name="search" /></span>
            <input className="text-input__input" placeholder="Search across all groups…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <button className="btn btn--default btn--sm" onClick={() => setOpenGroups(new Set(["process", "knowledge", "identity"]))}>Expand all</button>
          <button className="btn btn--default btn--sm" onClick={() => setOpenGroups(new Set())}>Collapse all</button>
          {selected.size > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <span className="text-xs fw-500" style={{ color: "var(--mantine-color-blue-8)" }}>{selected.size} selected</span>
              <button className="btn btn--light btn--sm">Enable</button>
              <button className="btn btn--default btn--sm">Disable</button>
              <button className="btn btn--danger-subtle btn--sm"><Icon name="trash" size={12} /> Delete</button>
            </div>
          )}
        </div>

        {groups.map(g => {
          const isOpen = openGroups.has(g.type);
          const activeCount = g.items.filter(b => b.active).length;
          return (
            <div key={g.type} className="paper" style={{ overflow: "hidden" }}>
              <button onClick={() => toggleGroup(g.type)} style={{
                width: "100%", border: "none", background: "transparent", cursor: "pointer",
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                borderBottom: isOpen ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ width: 4, height: 22, background: accent[g.type], borderRadius: 2 }} />
                <span style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 120ms", color: "var(--text-dimmed)", display: "grid", placeItems: "center" }}>
                  <Icon name="chevronRight" size={16} />
                </span>
                <span className="fw-600" style={{ fontSize: 15 }}>{TYPES[g.type].label}</span>
                <span className="badge badge--light-gray">{g.items.length}</span>
                <span className="text-xs text-dimmed">· {activeCount} active · <span className="text-mono">{g.tokens.toLocaleString()}</span> tokens</span>
                <span style={{ marginLeft: "auto" }} className="text-xs text-dimmed">{((g.tokens / TOKEN_BUDGET) * 100).toFixed(0)}% of budget</span>
                <button className="btn btn--subtle btn--xs" onClick={e => e.stopPropagation()}><Icon name="plus" size={12} /> Add</button>
              </button>

              {isOpen && (
                <div style={{ padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10, background: "var(--surface-subtle)" }}>
                  {g.items.map((b, i) => (
                    <BlockCard
                      key={b.id}
                      block={b}
                      index={i}
                      accent={accent[g.type]}
                      selected={selected.has(b.id)}
                      onSelect={() => toggleSelect(b.id)}
                      onToggle={() => toggleActive(b.id)}
                    />
                  ))}
                  {g.items.length === 0 && (
                    <div className="text-xs text-dimmed" style={{ padding: 20, textAlign: "center", gridColumn: "1 / -1" }}>No blocks match the current search.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function BlockCard({ block, index, accent, selected, onSelect, onToggle }) {
  return (
    <div className={"block-card paper paper--hover " + (!block.active ? "is-disabled" : "")}
      style={{
        padding: 12, position: "relative", background: "var(--surface)",
        borderColor: selected ? "var(--primary)" : "var(--border)",
        boxShadow: selected ? "0 0 0 1px var(--primary) inset" : "none",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span className={"checkbox" + (selected ? " checkbox--checked" : "")} onClick={onSelect} />
        <span className="drag-handle" draggable style={{ opacity: 0.6 }}><Icon name="drag" size={14} /></span>
        <span className="text-mono text-xs text-dimmed">{String(index + 1).padStart(2, "0")}</span>
        <span style={{ marginLeft: "auto" }} className="text-mono text-xs fw-500">{block.tokens}</span>
      </div>
      <div className="fw-500" style={{ fontSize: 13.5, lineHeight: 1.35, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{block.title}</div>
      <div className="text-xs text-dimmed" style={{ lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10, minHeight: 54 }}>{block.preview}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
        <label className="switch">
          <input type="checkbox" checked={block.active} onChange={onToggle} />
          <span className="switch__track"><span className="switch__thumb" /></span>
        </label>
        <span className="text-xs text-dimmed">{block.updated}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button className="action-icon action-icon--sm" title="Preview"><Icon name="eye" size={14} /></button>
          <button className="action-icon action-icon--sm" title="Edit"><Icon name="edit" size={14} /></button>
          <button className="action-icon action-icon--sm action-icon--danger" title="Delete"><Icon name="trash" size={14} /></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VariationC, BlockCard });
