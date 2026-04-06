# Admin Design System

## Purpose

A token-driven, framework-agnostic UI system for the Natural Resource admin interface. It exists to enforce a consistent visual language, strict dependency boundaries, and clean separation between presentational components and application logic. All components are composable building blocks — they know nothing about routing, auth, or data.

---

## Architecture Rules

These are non-negotiable.

### Dependency direction
```
tokens → primitives → composites → layout → app
```
Each layer may only import from layers above it in this chain. No skipping layers. No reverse imports.

### Token compliance
All visual values — colors, spacing, typography, radius, motion, border widths, layout dimensions — must flow through `tokens.*`. No hardcoded colors, magic numbers, or inline pixel values.

### Location-agnostic components
Everything under `/components/admin` accepts props, state, and callbacks only. No `next/navigation`, no `next/link`, no auth hooks, no data fetching. Routing and data are the application's responsibility.

### Layout ownership
Layout components (`/layout`) own structure and scroll behavior only. They have no knowledge of domain entities (prompts, sessions, users) and no business logic.

---

## Token System

**Location:** `/components/admin/theme/`

**Public entry point:** `tokens.ts` — the only file consumers should import from.

| File | Contents |
|---|---|
| `tokens.ts` | Public entry point. Aggregates and re-exports all token files. |
| `colors.ts` | Color primitives and semantic light/dark color tokens |
| `spacing.ts` | Spacing scale: `inset`, `stack`, `inline`, `gap` |
| `typography.ts` | Font families, sizes, weights, line heights, role-based presets |
| `radius.ts` | Border radius scale: `none` through `xl`, `pill`, `round` |
| `borders.ts` | Border width scale: `subtle`, `default`, `accent`, `strong` |
| `states.ts` | Interaction state tokens: `hover`, `active`, `focus`, `disabled`, `selected` |
| `motion.ts` | Duration, easing, and transition presets |
| `zIndex.ts` | Z-index scale: `base` through `tooltip` |
| `layout.ts` | Layout dimension tokens: `sidebar.width` |

**Usage:**
```ts
import { tokens } from '../theme/tokens';
```

---

## Component Inventory

### Primitives — `/components/admin/primitives/`

Atoms. Token-driven. No business logic. All export a forwarded ref.

| Component | Purpose |
|---|---|
| `Button` | Interactive button with `primary`, `secondary`, `ghost`, `danger` variants and `sm`, `md`, `lg` sizes |
| `Card` | Surface container with `default`, `outlined`, `interactive` variants |
| `Text` | Typography primitive with `body`, `label`, `title`, `muted` variants |
| `Badge` | Inline label with `default`, `success`, `warning`, `danger` variants and `sm`, `md` sizes |
| `Icon` | Icon wrapper standardizing size, color, and accessibility labeling |

### Composites — `/components/admin/content/` and `/components/admin/navigation/`

Compose from primitives only. No layout ownership. No framework coupling.

| Component | Location | Purpose |
|---|---|---|
| `Tag` | `content/` | Dismissible label with optional `onRemove` callback |
| `StatusBadge` | `content/` | Maps semantic status values (`active`, `inactive`, `draft`, `pending`, `error`) to `Badge` variants |
| `AddBlockButton` | `content/` | Ghost button with a plus icon for adding content blocks |
| `Accordion` | `content/` | Collapsible section with `max-height` CSS transition; content stays mounted |
| `SidebarItem` | `navigation/` | Dark-theme navigation button with active state and left border accent |
| `SidebarSection` | `navigation/` | Groups `SidebarItem` components under an optional muted label |
| `PromptCard` | `content/` | Outlined card showing a prompt's title, description, status, tags, and actions |

### Layout Shells — `/components/admin/layout/`

Own structure and scroll only. Slot/children-based. No domain knowledge.

| Component | Purpose |
|---|---|
| `SectionContainer` | Padding and gap wrapper with an optional header slot |
| `MainPanel` | Scrollable `<main>` with canvas surface background; fills remaining width |
| `Sidebar` | Dark `<nav>` shell with fixed width, scrollable content, and header/footer slots |
| `AppLayout` | Full-viewport flex root that composes the sidebar and main panel slots |

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Architecture rules locked | Complete |
| Phase 1 | Mantine v7 installed, theme bridge at `mantine-theme.ts` | Complete |
| Phase 2 | Primitives replaced with Mantine wrappers | Complete |
| Phase 3a | Composites replaced with Mantine components | Complete |
| Phase 3b | Navigation + layout replaced with Mantine AppShell + NavLink | Complete |
| Phase 3c | PromptBuilderChat migration | Next |
| Phase 4 | Remove legacy tokens.ts + unused layout shells | Pending |

---

## Phase 5 — App Integration

Wire the design system into the Next.js app layer.

**Files to create:**

### `/app/admin/layout.tsx`
The Next.js route layout for all admin pages. Renders `AppLayout` with a composed `Sidebar` (including `SidebarSection` and `SidebarItem` children) and wraps page content in `MainPanel`. This is the first and only place where navigation structure is defined.

### `/app/admin/prompt-builder/page.tsx`
The prompt builder page. Renders inside `MainPanel` via the layout. Composes `SectionContainer`, `PromptCard`, `AddBlockButton`, `Accordion`, and other composites into a working UI. This is where business logic, data, and routing connect to the design system — and the only layer where that connection is permitted.
