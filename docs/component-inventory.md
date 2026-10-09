# CTech UI — Inventário e fronteiras

## Regra de extração

Um componente entra em `@aoctech/ui` quando pelo menos dois produtos precisam do mesmo comportamento e da mesma semântica. Ele não entra apenas porque os dois têm aparência parecida. Componentes de domínio permanecem no produto.

## Fundamentos entregues

| Grupo | Componentes |
|---|---|
| Tema | `ThemeProvider`, cinco temas CTech, densidade, tokens core e semânticos |
| Ações | `Button` |
| Formulários | `Field`, `Input`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `DatePicker`/`Calendar` |
| Feedback | `Alert`, `Badge`, `Skeleton`, `EmptyState` |
| Estrutura | `PageHeader`, `Separator` |
| Overlay | `Modal` e `Drawer` baseados em Base UI |
| Navegação | `BottomNav` (mobile, com folha "Mais") e `UserMenu` (avatar, troca de visão, sair) |

## Próximas extrações — condicionadas a dois consumidores

1. Select, Combobox e Textarea.
2. Tooltip, Popover, DropdownMenu genérico, Toast e ConfirmDialog.
3. Tabs, Pagination, Breadcrumb e a navegação lateral de desktop (a de mobile já é `BottomNav`).
4. DataTable, filtros, seleção em lote e estados de lista.
5. AppShell e padrões de formulário multi-etapa.
6. Uma tela de status compartilhada (título + descrição + ação + slot de wordmark) para 404/500/manutenção — hoje cada produto reimplementa a própria (ex.: `ctech-billing/ui/src/components/StatusScreen.tsx`), inclusive o único consumidor atual deste pacote.

## Não centralizar

- Poker: mesa, cartas, fichas, assentos e mecânicas de jogo.
- DFE: emissão, tributação, CFOP, NCM e regras fiscais.
- Account: KYC, OAuth, escopos e autenticação.
- Wallet/Billing: PIX, razão, pagamento e recibos.

Esses fluxos usam fundações compartilhadas, mas preservam dados, linguagem e regras locais.
