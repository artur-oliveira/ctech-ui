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

Deliberately small. Components arrive when a second app needs one, not in anticipation — the whole
point of extracting this was to stop maintaining four copies, and a component with one consumer is
still one copy.

The extraction queue and non-domain boundaries live in [docs/component-inventory.md](docs/component-inventory.md). The source palette references and the rules for adding a product live in [docs/theme-registry.md](docs/theme-registry.md).

## Storybook

```sh
npm run storybook
```

The catalogue includes a theme registry and a state-coverage page. Its toolbar switches all five
themes and density modes, which makes visual drift visible before a component release.

## Peers

`react >=18`, `react-dom >=18`, `@base-ui/react >=1.7`, and Tailwind v4 in the consuming app.
