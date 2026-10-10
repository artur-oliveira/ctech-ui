# @aoctech/ui

The CTech component vocabulary, in one place. Base UI provides accessible behaviour; this package
owns the semantic token contract and ships official themes for Account, DFE, Wallet, Poker and
Billing. Each product keeps its identity without forking interactions or accessibility.

```sh
npm i @aoctech/ui
```

## The consumer supplies two things

### 1. The official theme contract

Import the shared tokens once and scope an official theme at the product root. The application may
extend a theme, but it must not redefine semantic status meaning.

```css
@import "tailwindcss";
@import "@aoctech/ui/styles.css";

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-brand-50: var(--brand-50);
  --color-brand-600: var(--brand-600);
  --color-brand-700: var(--brand-700);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-danger-strong: var(--danger-strong);
  --shadow-modal: var(--shadow-modal);
}
```

```tsx
import {ThemeProvider} from "@aoctech/ui"

export function App() {
  return <ThemeProvider theme="billing"><BillingApp /></ThemeProvider>
}
```

### 2. The `@source` line

Tailwind v4 only emits classes it can see. It does not scan `node_modules` by default, so without
this the components ship with no styles at all — the single most likely thing to go wrong on first
install.

```css
@source "../node_modules/@aoctech/ui/dist";
```

## Theme and status are separate contracts

`account`, `dfe`, `wallet`, `poker` and `billing` change action, focus, surfaces and brand hue.
The `success`, `warning` and `danger` roles remain consistent. A new product theme is added only
after its palette and contrast states are documented in Storybook.

## Density is a property of the surface

Controls are touch-sized by default (44px). A dense surface opts down by setting one attribute on
its root, and every control inside follows:

```tsx
<div data-density="compact">…</div>   {/* 32px controls */}
```

That is why `Button` has no `size="console"`: height is decided by where a button is, not by each
call site remembering which screen it is on.

A compact surface inside a comfortable app is a `DensityScope`. Unlike a bare attribute, it also
reaches the overlays opened from inside it: `Drawer`, `Modal`, `Select` and `RowMenu` render in a
portal, outside the element that carries `data-density`, and follow the nearest scope (else the
`ThemeProvider`). A compact console therefore gets compact drawers, on a desktop too. `Drawer`,
`Modal` and `Select` also take a `density` prop that overrides both.

```tsx
<ThemeProvider theme="billing">          {/* the portal: comfortable */}
  <DensityScope density="compact">       {/* the console */}
    <Drawer …/>                          {/* compact as well */}
  </DensityScope>
</ThemeProvider>
```

### Touch: compact look, 44px target

Under a finger (a coarse pointer, or a viewport under Tailwind's `sm`), a compact control is
**drawn** at 36px and **hit** at 44px: an invisible `::after` centred on it, shipped in
`styles.css` (`touch.css`) and keyed on each control's `data-slot`. Nothing to wire up. The rules:

- The target grows only on an axis where the control is short of 44px, and sideways by at most
  4px. **Keep 8px (`gap-2`) between neighbouring controls**, in a row or a stack: two extensions
  then meet and never overlap (with less, the later control wins the shared edge).
- Icon buttons stay square (36 x 36 drawn, 44 x 44 hit).
- `Segmented` segments touch, so theirs grow vertically only, at every density.
- An input is reached through its `Field` label, whose target sits behind the field's content: a
  link or button in a hint or error keeps its own taps.
- Select options and menu items are 44px rows under touch.
- Anything else drawn as a control (a link styled as a button, a tab) opts in with the class
  `touch-target`. A control the caller positions (`absolute`, `fixed`, `sticky`) keeps its position.

## Brand colour and status colour never meet

`Button variant="brand"` is the only place brand colour appears. `Badge` carries the four status
tones — `neutral`, `positive`, `attention`, `urgent` — and they are **fixed**: never recoloured to
match a surface's accent.

The reason is legibility across the family. An operator who learns that a green badge means settled
has to be able to read that on every screen of every CTech app; a tone that shifts with the surface
is a tone that has to be relearned per app. It also keeps warm-brand apps honest — billing's
terracotta sits near its own danger red, and the rule is what stops the two ever rendering on one
component. (Separating them by role was necessary and not sufficient: billing also had to pull its
brand chroma down until `danger` was the only saturated colour on a screen.)

The four tones are the same closed set the CTech APIs emit alongside a human-readable state string,
so a badge renders what the server said rather than a client-side mapping of an internal enum.

## What's here

| Component | Notes |
|---|---|
| `Button` | Variants `brand` · `outline` · `ghost` · `danger` · `link`. Density-aware. |
| `Input` + `Field` | Visible labels, hint/error copy and invalid state vocabulary. |
| `Alert` | Info, success, warning and danger feedback. |
| `Badge` | The four status tones. Pair with a glyph — never colour alone. |
| `Modal` | Base UI `Dialog`: real focus trap, scroll lock, restore focus, Escape. |
| `PageHeader` | One h1, one optional line, one optional action. |
| `EmptyState` | Title, description, optional action. |
| `Skeleton` | Honours `prefers-reduced-motion`. |
| `Separator` | Horizontal and vertical. |
| `Checkbox` | Base UI `Checkbox`. |
| `Radio` + `RadioGroup` | Base UI `Radio`. |
| `Switch` | Base UI `Switch`. |
| `DatePicker` + `Calendar` | Built on `react-day-picker`. `locale` (BCP-47, default `"pt-BR"`; `"en"` built in) drives calendar names, first weekday, displayed date (Intl) and aria copy; `labels` overrides single strings. `Modal` and `ErrorState` take the same `locale` (Modal also `labels`). Since 0.2.0. |
| `BottomNav` | Phone-only primary nav (hidden from `md`): up to four tabs, an optional central action, an optional "more" tab that opens a bottom sheet (Base UI `Drawer`). Since 0.3.0. |
| `UserMenu` | Avatar (initials or image) opening a Base UI `Menu`: full name and e-mail, optional view switcher, extra items, sign-out. Since 0.3.0. |
| `Select` | Base UI `Select`. Shows the chosen label, never the value; optional decorative option `icon`s, an optional `none` option, and `actions` ("+ Novo espaço") that run only from a press in the open list. Since 0.4.0. |
| `Segmented` | Two to four mutually exclusive choices as toggle buttons (`aria-pressed`); text or icon labels with full names; `fill` for a phone's full width. Since 0.4.0. |
| `RowMenu` | A row's visible "⋯" menu (Base UI `Menu`). Default name "Mais ações" / "More actions". Since 0.4.0. |
| `SwipeRow` + `useSwipeReveal` | Swipe left to reveal a row's actions, on a phone. Always paired with `RowMenu`. Since 0.4.0. |
| `DensityScope` | A compact (or comfortable) surface whose overlays follow it. Since 0.4.0. |

### Navigation: `BottomNav` and `UserMenu`

Neither knows anything about routing. The caller says which item is `active` (or `current`) from
its own router, and passes `renderLink` so links navigate client-side; without it a plain `<a>` is
rendered. Items take `href` (a link) or `onClick` (a button).

```tsx
import Link from "next/link"
import {BottomNav, BottomNavSpacer, UserMenu, type RenderLink} from "@aoctech/ui"

const renderLink: RenderLink = props => <Link {...props} />

<UserMenu
  name={session.name}
  email={session.email}
  imageUrl={session.avatarUrl}
  views={[
    {label: "Portal", href: "/dashboard", current: !inConsole},
    {label: "Console", href: "/console/overview", current: inConsole},
  ]}
  onSignOut={logout}
  renderLink={renderLink}
/>

<main>
  {children}
  <BottomNavSpacer />   {/* keeps the page's end clear of the bar; gone from md up */}
</main>
<BottomNav
  renderLink={renderLink}
  action={{label: "Novo", icon: <Plus />, onClick: openCreate}}   // or null on screens without one
  items={[
    {label: "Resumo", icon: <Home />, href: "/console/finance", active: pathname === "/console/finance"},
    {label: "A pagar/receber", icon: <Receipt />, href: "/console/finance/bills", active: is("/bills")},
    {label: "Extrato", icon: <List />, href: "/console/finance/statement", active: is("/statement")},
    {type: "more", label: "Mais", icon: <Menu />, items: [
      {label: "Recorrências", icon: <Repeat />, href: "/console/finance/recurrences", active: is("/recurrences")},
      {label: "Cartões", icon: <CreditCard />, href: "/console/finance/cards", active: is("/cards")},
      {label: "Importar", icon: <Upload />, href: "/console/finance/import", active: is("/import")},
      {label: "Relatórios", icon: <Chart />, href: "/console/finance/reports", active: is("/reports"), group: "Análise"},
      {label: "Configuração", icon: <Settings />, href: "/console/finance/accounts", active: is("/accounts"), group: "Análise"},
    ]},
  ]}
/>
```

- **Four tabs at most**, split evenly around the action, which stays dead centre. Labels wrap to two
  lines (after a `/` first) rather than truncating; keep them short anyway.
- **The "more" tab** is shown active when any sheet item is (`active` overrides). Sheet items with
  the same `group` are listed under that heading. Choosing one closes the sheet; Escape, the close
  button and swipe-down close it too, and focus returns to the tab.
- **Safe area:** the bar pads itself by `env(safe-area-inset-bottom)` — the app needs
  `viewport-fit=cover` in its viewport meta for that inset to be non-zero. Clear the page's end
  with `<BottomNavSpacer />`, or with the `bottomNavInset` class string on a container that owns its
  bottom padding.
- **Always touch-sized**, whatever `data-density` says: a console that is compact on a desk is still a
  thumb on a phone. Bar targets are 72px tall and at least 60px wide on a 320px screen; sheet rows are 48px tall.
- **Copy:** `locale` (default `"pt-BR"`) and `labels` as in `Modal` — `BottomNav` labels `nav`,
  `close`; `UserMenu` labels `trigger`, `views`, `signOut`.

### Interactions: `Segmented`, `Select`, `RowMenu`, `SwipeRow`

```tsx
import {RowMenu, Segmented, Select, SwipeRow, type RowMenuItem} from "@aoctech/ui"

<Segmented
  label="Período"                       // names the group
  value={period}
  onValueChange={setPeriod}
  options={[
    {value: "6m", label: "6 m", name: "6 meses"},   // a short label carries its full name
    {value: "chart", label: <ChartIcon />, name: "Gráfico"},
  ]}
  fill                                  // share a phone's full width
/>

<Field label="Bandeira" htmlFor="brand">
  <Select
    id="brand"
    value={brand}                       // "" is "nothing chosen"
    onValueChange={setBrand}
    options={[{value: "visa", label: "Visa", icon: <VisaMark />}]}   // icons are decoration
    none="Nenhuma"                      // or `none` for the catalogue's "Nenhum" / "None"
    actions={[{label: "Nova bandeira", icon: <Plus />, onSelect: openCreate}]}
  />
</Field>
```

`Select`'s actions run only on a press in the open list (`reason === "item-press"`): Base UI types
ahead on a closed, focused trigger, and "n" there must not start "Novo espaço" and leave the page.

**A swipe is never the only way in.** `SwipeRow` reveals a row's secondary actions under a finger;
the same actions must also be one press away, in a `RowMenu` on the row (or inline buttons where
there is room). The revealed strip is inert until uncovered, so a keyboard or screen reader uses
the menu.

```tsx
const actions: RowMenuItem[] = [
  {key: "edit", label: "Editar", onSelect: openEdit},
  {key: "del", label: "Excluir", destructive: true, onSelect: confirmDelete},   // open a confirmation
]

<li>
  <SwipeRow actions={actions}>                {/* the front: opaque, it covers the actions */}
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex-1">Aluguel</span>
      <RowMenu label="Mais ações: Aluguel" items={actions} />
    </div>
  </SwipeRow>
</li>
```

- The gesture locks to an axis after 8px (the row sets `touch-action: pan-y`, so a vertical drag
  stays the page's scroll), opens past 35% of the revealed width and snaps back otherwise, keeps
  one row open per page, and closes on a press elsewhere or Escape. It follows
  `prefers-reduced-motion`.
- A drag never eats the next tap; a second finger, a cancelled gesture, lost pointer capture or the
  window losing focus returns the row to rest.
- Phones only by default (`media="(max-width: 39.999rem)"`); `media={null}` swipes everywhere.
- For a custom layout, `useSwipeReveal(width, {enabled, media})` returns `{open, active, rowId,
  offset, dragging, close, bind}`: put `data-swipe-row={rowId}` on the row's root and spread `bind`
  on the part that slides.

Deliberately small. Components arrive when a second app needs one, not in anticipation — the whole
point of extracting this was to stop maintaining four copies, and a component with one consumer is
still one copy.

The extraction queue and non-domain boundaries live in [docs/component-inventory.md](docs/component-inventory.md). The source palette references and the rules for adding a product live in [docs/theme-registry.md](docs/theme-registry.md).

## Tests

```sh
npm test   # node:test for pure logic, vitest + jsdom for component behaviour, then the build
```

## Storybook

```sh
npm run storybook
```

The catalogue includes a theme registry and a state-coverage page. Its toolbar switches all five
themes and density modes, which makes visual drift visible before a component release.

## Peers

`react >=18`, `react-dom >=18`, `@base-ui/react >=1.7`, and Tailwind v4 in the consuming app.
