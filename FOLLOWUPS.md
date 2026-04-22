# Followups

Deferred issues and design reviews surfaced during work. Each entry
has a date, source commit or step, description, and disposition.

---

## 2026-04-22

### SegmentedTokenMeter — warning label color not visually shifting at 5000–8000 tokens

- **Source:** Step 13 live verification (commit `5b8f22a`).
- **Observation:** When total tokens cross the `YELLOW_THRESHOLD = 5000`
  but stay under `TOKEN_LIMIT = 8000`, the meter label is supposed to
  shift to `var(--mantine-color-yellow-8)` as a heads-up. In live
  verification it doesn't visibly change.
- **Likely cause (not yet confirmed):** the label renders through the
  project's `Text` primitive (`components/admin/primitives/Text.tsx`)
  which spreads a Mantine `c: 'dimmed'` via `variantMap.muted`. Mantine's
  `c` prop sets the text color via a dedicated CSS path that likely wins
  over the inline `style.color` we're trying to set. Replacing the `Text`
  wrapper with a raw `<span>` or `<p>` styled with only the inline color
  should restore the threshold visual.
- **Blocking?** No — over-budget (> 8000) red still works because the
  visible cue is also the bar segments turning red, not just the label.
  The warning tier loses its subtle label heads-up but functions
  otherwise.
- **Disposition:** deferred for later review. Fix when we touch
  `SegmentedTokenMeter` next or during the Phase 2 meter pass.

### SegmentedTokenMeter — segment order couples to table order

- **Source:** Step 13 live verification (commit `5b8f22a`).
- **Observation:** The meter renders segments in the same order as the
  active-blocks array, which is the same order as the table rows. With
  many blocks of different types interleaved by user-chosen `order`
  field, the meter becomes visually chaotic — adjacent segments
  constantly switch colors.
- **Design question:** should the meter sort by type (grouping all
  guardrails, then identities, etc.) regardless of table order, so
  color bands read as contiguous? Pro: easier to scan "how much of my
  budget is guardrail vs knowledge." Con: segment position no longer
  maps to table row position, so hover tooltips can't double as a "find
  this block in the list" affordance.
- **Blocking?** No — the meter is functional, just visually noisy.
- **Disposition:** deferred for design review. Options to consider:
  (a) sort by type inside the meter only, (b) add a toggle between
  "list order" and "type order", (c) group segments by type with a
  small gap between type runs while preserving intra-type table order.
