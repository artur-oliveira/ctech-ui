import {useState} from "react"
import type {Meta, StoryObj} from "@storybook/react-vite"

import {BottomNav as BottomNavComponent, BottomNavSpacer} from "./components/bottom-nav"
import {UserMenu as UserMenuComponent} from "./components/user-menu"

/* Story-only glyphs; products pass their own icon set (lucide in billing/dfe). */
const glyph = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const Home = glyph("M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z")
const Bills = glyph("M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zM9 8h6M9 12h6")
const List = glyph("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01")
const More = glyph("M4 6h16M4 12h16M4 18h16")
const Plus = glyph("M12 5v14M5 12h14")
const Repeat = glyph("M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3")
const Card = glyph("M3 6h18v12H3zM3 10h18")
const Upload = glyph("M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4")
const Chart = glyph("M4 20V10M10 20V4M16 20v-7M22 20H2")
const Gear = glyph("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z")

const SECTIONS = ["Resumo", "A pagar/receber", "Extrato", "Recorrências", "Cartões", "Importar", "Relatórios", "Configuração"] as const

function FinanceScreen({withAction = true}: {withAction?: boolean}) {
  const [current, setCurrent] = useState<(typeof SECTIONS)[number]>("Resumo")
  const go = (label: (typeof SECTIONS)[number]) => ({onClick: () => setCurrent(label), active: current === label})
  return (
    <div className="mx-auto max-w-md">
      <header className="flex items-center justify-between gap-3 pb-4">
        <h1 className="m-0 text-xl font-semibold tracking-[-0.02em]">{current}</h1>
        <UserMenuComponent
          name="Maria Aparecida dos Santos Albuquerque"
          email="maria.albuquerque@exemplo.com.br"
          views={[{label: "Portal", onClick: () => {}}, {label: "Console", onClick: () => {}, current: true}]}
          onSignOut={() => {}}
        />
      </header>
      <div className="space-y-3">
        {Array.from({length: 12}, (_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
            <span>Lançamento {i + 1}</span>
            <span className="tabular-nums text-muted-foreground">R$ {(i * 37.5 + 12).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
      </div>
      <BottomNavSpacer />
      <BottomNavComponent
        action={withAction ? {label: "Novo", icon: Plus, onClick: () => {}} : null}
        items={[
          {label: "Resumo", icon: Home, ...go("Resumo")},
          {label: "A pagar/receber", icon: Bills, ...go("A pagar/receber")},
          {label: "Extrato", icon: List, ...go("Extrato")},
          {
            type: "more",
            label: "Mais",
            icon: More,
            title: "Finanças",
            items: [
              {label: "Recorrências", icon: Repeat, ...go("Recorrências")},
              {label: "Cartões", icon: Card, ...go("Cartões")},
              {label: "Importar", icon: Upload, ...go("Importar")},
              {label: "Relatórios", icon: Chart, ...go("Relatórios"), group: "Análise e ajustes"},
              {label: "Configuração", icon: Gear, ...go("Configuração"), group: "Análise e ajustes"},
            ],
          },
        ]}
      />
    </div>
  )
}

const meta = {title: "Components/Navigation", component: FinanceScreen, parameters: {viewport: {defaultViewport: "mobile1"}}} satisfies Meta<typeof FinanceScreen>
export default meta

export const BottomNav: StoryObj<typeof meta> = {name: "Bottom nav (mobile)"}
export const BottomNavWithoutAction: StoryObj<typeof meta> = {name: "Bottom nav, no action", args: {withAction: false}}
export const UserMenu: StoryObj = {
  render: () => (
    <div className="flex justify-end">
      <UserMenuComponent
        name="Maria Aparecida dos Santos Albuquerque de Oliveira"
        email="maria.aparecida.albuquerque.oliveira@exemplo-empresa.com.br"
        views={[{label: "Portal", href: "#portal", current: true}, {label: "Console", href: "#console"}]}
        items={[{label: "Perfil", href: "#perfil"}]}
        onSignOut={() => {}}
      />
    </div>
  ),
}
