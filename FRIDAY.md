# Friday cleanup — Sage Blocks redesign PR

Captured during Steps 6–18. Do not address inside per-step commits.
Each item is either polish, deferred refactor, or doc debt.

## Refactors

- [ ] **AppShell refactor for admin layout.** Hoist Mantine primitives
      to admin layout file to remove from per-route critical path.
      Should reduce First Load JS on /admin/prompt-studio/blocks and
      sibling routes. Replaces the inline `flex:1 + overflow:auto`
      pattern (`SCROLL_AREA_STYLE` constant in blocks/page.tsx).
      Also resolves the `flex-1` and `overflow-auto` items from the
      Step 6 Tailwind→Mantine migration that landed as inline styles.

- [ ] **BlockEditForm render-site cast cleanup.** Lines 122, 215, 241
      in components/admin/content/BlockEditForm.tsx use `props as ModeProps`
      casts inside JSX because TypeScript loses narrowing across the
      JSX boundary. Refactor to split-render functions
      (renderNewMode/renderEditMode) that take typed props directly.
      ~20 min. Drops 3 casts, gains type-safe rendering inside each
      branch. Group 1 bridge casts (lines 101, 104, 109, 112, 118, 119)
      and Group 2 Mantine setter cast (line 173) stay as-is — those
      are structural to the discriminated union and Mantine's Select
      API respectively.

- [ ] **Drawer vs inline-edit decision.** When Step 12 lands (order
      column → monospace prefix, manual edit moves to drawer), eyeball
      whether the expanded row preview is the natural place to edit
      blocks instead of the drawer. Make the call from the live page,
      not in the abstract.

## Performance tracking

- [ ] **First Load JS budget.** Step 6 baseline: 275 kB on
      /admin/prompt-studio/blocks. Step 7: 276 kB (+1 kB). Track per
      step. If it exceeds 350 kB before Friday, escalate AppShell
      refactor priority.

## CLAUDE.md updates (batch on Friday)

- [ ] JSX text content with apostrophes uses `&apos;`
      (react/no-unescaped-entities lint rule)
- [ ] New schema columns documented (already done in Step 2 — verify
      still accurate after all 18 steps)
- [ ] `updated_by` stamping pattern: PATCH and POST endpoints both
      stamp from `authCtx.owner_id` (Steps 3 and 7)
- [ ] Any new patterns established by Steps 8–18
- [ ] Reaffirm: Mantine primitives only in admin, no Tailwind,
      no raw divs

## Polish items

(populate as Steps 8–18 surface them)

- [ ]

## Verification protocol additions

(populate as Steps 8–18 surface them)

- [ ]

## Product / scope review

- [ ] **Manual + New block button — keep or remove?** The Composer
      is the intended primary path for block creation. The manual
      form button (Step 7) was specced before Composer was working
      end-to-end. Built it anyway in Step 7 for V1 completeness.
      Re-evaluate after Sage chat redesign ships and real usage
      data accumulates. If nobody uses the manual form, replace
      with a "Compose new block" deep-link to the Composer.

## Data integrity

- [ ] **Backfill `updated_by` on pre-Step-7 blocks.** Step 3 added
      `updated_by` stamping to PATCH only. Step 7 added it to POST
      (`/api/admin/blocks/save`). Any blocks created via POST
      between Step 3 merge and Step 7 merge have NULL `updated_by`.
      Run a one-time backfill query if Step 14's author attribution
      shows missing data. Likely zero rows in production, but verify.
