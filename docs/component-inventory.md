# CTech UI — Inventário e fronteiras

## Regra de extração

Um componente entra em `@aoctech/ui` quando pelo menos dois produtos precisam do mesmo comportamento e da mesma semântica. Ele não entra apenas porque os dois têm aparência parecida. Componentes de domínio permanecem no produto.

## Fundamentos entregues

| Grupo | Componentes |
|---|---|
| Tema | `ThemeProvider`, `DensityScope`, cinco temas CTech, densidade, tokens core e semânticos, alvo de toque (`touch.css`) |
| Ações | `Button`, `Segmented`, `RowMenu` |
| Formulários | `Field`, `Input`, `Select`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `DatePicker`/`Calendar` |
| Listas | `SwipeRow`/`useSwipeReveal` (sempre com `RowMenu`: o gesto nunca é o único caminho) |
| Feedback | `Alert`, `Badge`, `Skeleton`, `EmptyState` |
| Estrutura | `PageHeader`, `Separator` |
| Overlay | `Modal` e `Drawer` baseados em Base UI |
| Navegação | `AppShell` + `SidebarNav` (barra no topo, rail de seções fixo à esquerda a partir de `md`), `BottomNav` (mobile, com folha "Mais") e `UserMenu` (avatar ou linha, troca de visão, grupos de escolha como o modo, sair), `CommandPalette` (busca ⌘K de telas e ações, `matchEntries` sem acento) |

## Próximas extrações — condicionadas a dois consumidores

1. Combobox e Textarea.
2. Tooltip, Popover, DropdownMenu genérico, Toast e ConfirmDialog.
3. Tabs, Pagination e Breadcrumb.
4. DataTable, filtros, seleção em lote e estados de lista.
5. Padrões de formulário multi-etapa. (`AppShell` entrou na 0.6.0 por decisão do dono, 2026-10-14, com billing como primeiro consumidor e os outros produtos como alvo.)
6. Uma tela de status compartilhada (título + descrição + ação + slot de wordmark) para 404/500/manutenção — hoje cada produto reimplementa a própria (ex.: `ctech-billing/ui/src/components/StatusScreen.tsx`), inclusive o único consumidor atual deste pacote.

## Não centralizar

- Poker: mesa, cartas, fichas, assentos e mecânicas de jogo.
- DFE: emissão, tributação, CFOP, NCM e regras fiscais.
- Account: KYC, OAuth, escopos e autenticação.
- Wallet/Billing: PIX, razão, pagamento e recibos.

Esses fluxos usam fundações compartilhadas, mas preservam dados, linguagem e regras locais.
