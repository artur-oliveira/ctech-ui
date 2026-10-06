# Registro de temas CTech

Este é o inventário central de referências visuais atuais. `src/styles/themes.css`
é o contrato executável que os componentes consomem; esta página preserva as
paletas de origem e explica como cada marca entra no contrato.

## Temas oficiais

| Produto | Identidade           | Fonte de referência                    | Papel no Design System                                    |
|---------|----------------------|----------------------------------------|-----------------------------------------------------------|
| Account | azul, hue 258        | `ctech-account/ui/src/app/globals.css` | identidade de conta e autenticação                        |
| DFE     | verde/teal fiscal    | `ctech-dfe/ui/src/app/globals.css`     | console fiscal e documentos eletrônicos                   |
| Wallet  | violeta              | `ctech-wallet/ui/src/app/globals.css`  | saldo, razão e movimentações                              |
| Poker   | vinho, feltro e ouro | `ctech-poker/ui/src/app/globals.css`   | experiência imersiva; só os controles compartilham a base |
| Billing | terracota, hue 45    | `ctech-billing/ui/src/app/globals.css` | cobrança e pagamentos                                     |

## Referências de marca atuais

| Tema    | 50                    | 100                  | 200       | 300       | 400       | 500       | 600                  | 700                  | 800       | 900       |
|---------|-----------------------|----------------------|-----------|-----------|-----------|-----------|----------------------|----------------------|-----------|-----------|
| DFE     | `#f0faf6`             | `#d4f1e6`            | `#a9e3cd` | `#74cfb0` | `#44b896` | `#2ea87f` | `#1c6c55`            | `#195644`            | `#195644` | `#164738` |
| Wallet  | `#f5f3ff`             | `#ede9fe`            | `#ddd6fe` | `#c4b5fd` | `#a78bfa` | `#8b5cf6` | `#7c3aed`            | `#6d28d9`            | `#5b21b6` | `#4c1d95` |
| Billing | `oklch(.965 .014 45)` | `oklch(.93 .028 45)` | —         | —         | —         | —         | `oklch(.44 .095 45)` | `oklch(.38 .085 45)` | —         | —         |

Account é definido hoje por aliases semânticos: ação principal em
`oklch(.55 .22 258)` e foco em `oklch(.62 .2 258)`. Poker é propositalmente
uma paleta de ambiente, não uma escala linear: marca `#af2a2f`, vinho
`#5b1218`, tinta `#120d0e`, papel `#f6f0e7`, ouro `#e6b85c` e feltro
`#0d5b45`.

## Regras de governança

1. Uma referência de origem não é automaticamente um token de componente.
2. Produtos mapeiam `brand`, superfície e foco; semânticas de estado mantêm o mesmo significado.
3. Um novo produto entra com sua paleta de origem, mapeamento semântico e prévia Storybook em claro/escuro quando
   aplicável.
4. O componente usa papéis como `brand`, `danger` e `surface`; nunca o nome de uma marca.

## Auction (adição compatível)

CTech Auction usa petróleo (hue 215), distinto de DFE e Account. `brand-50` = `oklch(.96 .022 215)`, `brand-600` = `oklch(.47 .08 215)`, `brand-700` = `oklch(.40 .07 215)`, foco em `brand-600`. Conserva os tokens de superfície, estados e escala comuns. ThemeProvider aceita `auction`, inclusive em portais; nenhum tema/default existente muda. A prévia de Theme Registry inclui Auction. Modo escuro não é prometido por esta adição. Disponível em @aoctech/ui 0.1.2; não exige atualização dos demais produtos.
