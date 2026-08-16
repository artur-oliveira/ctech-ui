# CTech UI — Inventário e fronteiras

## Regra de extração

Um componente entra em `@aoctech/ui` quando pelo menos dois produtos precisam do mesmo comportamento e da mesma semântica. Ele não entra apenas porque os dois têm aparência parecida. Componentes de domínio permanecem no produto.

## Fundamentos entregues

| Grupo | Componentes |
|---|---|
| Tema | `ThemeProvider`, cinco temas CTech, densidade, tokens core e semânticos |
| Ações | `Button` |
| Formulários | `Field`, `Input` |
| Feedback | `Alert`, `Badge`, `Skeleton`, `EmptyState` |
| Estrutura | `PageHeader`, `Separator` |
| Overlay | `Modal` baseado em Base UI |

## Próximas extrações — condicionadas a dois consumidores

1. Select, Combobox, Checkbox, Switch, Radio e Textarea.
2. Tooltip, Popover, DropdownMenu, Toast e ConfirmDialog.
3. Tabs, Pagination, Breadcrumb e navegação responsiva.
4. DataTable, filtros, seleção em lote e estados de lista.
5. AppShell e padrões de formulário multi-etapa.

## Não centralizar

- Poker: mesa, cartas, fichas, assentos e mecânicas de jogo.
- DFE: emissão, tributação, CFOP, NCM e regras fiscais.
- Account: KYC, OAuth, escopos e autenticação.
- Wallet/Billing: PIX, razão, pagamento e recibos.

Esses fluxos usam fundações compartilhadas, mas preservam dados, linguagem e regras locais.
