import {useState} from "react"
import type {Meta, StoryObj} from "@storybook/react-vite"

import {Button} from "./components/button"
import {Drawer} from "./components/drawer"
import {Field} from "./components/field"
import {Input} from "./components/input"
import {RowMenu as RowMenuComponent, type RowMenuItem} from "./components/row-menu"
import {Segmented as SegmentedComponent} from "./components/segmented"
import {Select as SelectComponent} from "./components/select"
import {SwipeRow as SwipeRowComponent} from "./components/swipe-row"
import {DensityScope} from "./components/theme-provider"

/* Story-only glyphs; products pass their own icon set. */
const glyph = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const Chart = glyph("M4 20V10M10 20V4M16 20v-7M22 20H2")
const Rows = glyph("M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01")
const Plus = glyph("M12 5v14M5 12h14")
const Swatch = ({hue}: {hue: number}) => <span className="block size-3 rounded-full" style={{background: `oklch(0.6 0.15 ${hue})`}} />

function SegmentedExample() {
  const [period, setPeriod] = useState<"3m" | "6m" | "12m">("6m")
  const [view, setView] = useState<"chart" | "rows">("chart")
  const [side, setSide] = useState<"in" | "out">("in")
  return (
    <main className="mx-auto grid max-w-md gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedComponent label="Período" value={period} onValueChange={setPeriod} options={[
          {value: "3m", label: "3 m", name: "3 meses"},
          {value: "6m", label: "6 m", name: "6 meses"},
          {value: "12m", label: "12 m", name: "12 meses"},
        ]} />
        <SegmentedComponent label="Vista" value={view} onValueChange={setView} options={[
          {value: "chart", label: Chart, name: "Gráfico"},
          {value: "rows", label: Rows, name: "Linhas"},
        ]} />
        <Button variant="outline">Exportar</Button>
      </div>
      <SegmentedComponent label="Direção" fill value={side} onValueChange={setSide} options={[
        {value: "in", label: "A receber"},
        {value: "out", label: "A pagar"},
      ]} />
    </main>
  )
}

const ROWS = [
  {title: "Aluguel", meta: "Vence 10/11 · Conta corrente", amount: "R$ 1.800,00"},
  {title: "Internet fibra 500 mega com telefone fixo", meta: "Vence 15/11 · Cartão final 4421", amount: "R$ 119,90"},
  {title: "Condomínio", meta: "Vence 20/11 · Conta corrente", amount: "R$ 640,00"},
]

function SwipeListExample({everywhere = false}: {everywhere?: boolean}) {
  const [log, setLog] = useState("Deslize uma linha para a esquerda, ou use ⋯.")
  return (
    <main className="mx-auto max-w-md">
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">{log}</p>
      <ul className="m-0 list-none divide-y divide-border border-y border-border p-0">
        {ROWS.map(row => {
          const actions: RowMenuItem[] = [
            {key: "edit", label: "Editar", onSelect: () => setLog(`Editar: ${row.title}`)},
            {key: "del", label: "Excluir", destructive: true, onSelect: () => setLog(`Confirmar exclusão: ${row.title}`)},
          ]
          return (
            <li key={row.title}>
              <SwipeRowComponent actions={actions} media={everywhere ? null : undefined}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 py-2.5">
                  <div className="min-w-0">
                    <p className="m-0 line-clamp-2 text-sm text-foreground">{row.title}</p>
                    <p className="m-0 text-xs text-muted-foreground">{row.meta}</p>
                  </div>
                  <span className="text-sm tabular-nums">{row.amount}</span>
                  {/* The gesture is never the only way: the same actions, one press away. */}
                  <RowMenuComponent label={`Mais ações: ${row.title}`} items={actions} />
                </div>
              </SwipeRowComponent>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

function SelectExample() {
  const [account, setAccount] = useState("acc_01")
  const [brand, setBrand] = useState("")
  const [space, setSpace] = useState("home")
  return (
    <main className="mx-auto grid max-w-sm gap-5">
      <Field label="Conta" htmlFor="s-account">
        <SelectComponent id="s-account" value={account} onValueChange={setAccount} options={[
          {value: "acc_01", label: "Conta corrente"},
          {value: "acc_02", label: "Poupança"},
          {value: "acc_03", label: "Conta de investimento com nome longo"},
        ]} />
      </Field>
      <Field label="Categoria" htmlFor="s-brand" hint="Opcional.">
        <SelectComponent id="s-brand" value={brand} onValueChange={setBrand} none="Nenhuma" options={[
          {value: "home", label: "Moradia", icon: <Swatch hue={45} />},
          {value: "food", label: "Alimentação", icon: <Swatch hue={150} />},
          {value: "fun", label: "Lazer", icon: <Swatch hue={296} />},
        ]} />
      </Field>
      <Field label="Espaço" htmlFor="s-space">
        <SelectComponent id="s-space" value={space} onValueChange={setSpace}
          options={[{value: "home", label: "Casa"}, {value: "work", label: "Empresa"}]}
          actions={[{label: "Novo espaço", icon: Plus, onSelect: () => alert("Novo espaço")}]} />
      </Field>
    </main>
  )
}

/** Toggle the toolbar's density to compact and use a phone viewport (or touch emulation). */
function TouchTargetsExample() {
  const [period, setPeriod] = useState<"m" | "y">("m")
  const [space, setSpace] = useState("home")
  return (
    <DensityScope density="compact" className="mx-auto grid max-w-sm gap-4">
      <p className="m-0 text-sm text-muted-foreground">
        Sob toque, um controle compacto é desenhado com 36px e atingido com 44px. O tracejado mostra cada área de toque.
      </p>
      <div className="flex flex-wrap items-center gap-2 [&_*::after]:outline-1 [&_*::after]:outline-dashed [&_*::after]:outline-brand-600/40">
        <SelectComponent aria-label="Espaço" className="w-40" value={space} onValueChange={setSpace} options={[{value: "home", label: "Casa"}, {value: "work", label: "Empresa"}]} />
        <SegmentedComponent label="Período" value={period} onValueChange={setPeriod} options={[{value: "m", label: "Mês"}, {value: "y", label: "Ano"}]} />
        <Button size="icon" variant="outline" aria-label="Adicionar">{Plus}</Button>
        <Button>Salvar</Button>
      </div>
      <Field label="Descrição" htmlFor="t-desc" hint="Aparece no extrato.">
        <Input id="t-desc" defaultValue="Aluguel" />
      </Field>
    </DensityScope>
  )
}

function CompactDrawerExample() {
  const [open, setOpen] = useState(true)
  const [kind, setKind] = useState("out")
  return (
    <DensityScope density="compact" className="mx-auto max-w-5xl">
      <Button onClick={() => setOpen(true)}>Novo lançamento</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Novo lançamento" description="Um console compacto abre gavetas compactas, no desktop também."
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => setOpen(false)}>Adicionar</Button></div>}>
        <div className="grid gap-4">
          <SegmentedComponent label="Tipo" fill value={kind} onValueChange={setKind} options={[{value: "out", label: "A pagar"}, {value: "in", label: "A receber"}]} />
          <Field label="Descrição" htmlFor="d-desc"><Input id="d-desc" /></Field>
          <Field label="Conta" htmlFor="d-acc"><SelectComponent id="d-acc" value="" onValueChange={() => {}} options={[{value: "a", label: "Conta corrente"}]} /></Field>
        </div>
      </Drawer>
    </DensityScope>
  )
}

const meta = {title: "Components/Interactions", component: SegmentedExample} satisfies Meta<typeof SegmentedExample>
export default meta

export const Segmented: StoryObj<typeof meta> = {}
export const RowMenu: StoryObj = {render: () => <main className="flex justify-end"><RowMenuComponent items={[{label: "Editar", onSelect: () => {}}, {label: "Duplicar", onSelect: () => {}}, {label: "Excluir", destructive: true, onSelect: () => {}}]} /></main>}
export const SwipeRow: StoryObj = {render: () => <SwipeListExample />, name: "Swipe row + row menu (phone)", parameters: {viewport: {defaultViewport: "mobile1"}}}
export const SwipeRowEverywhere: StoryObj = {render: () => <SwipeListExample everywhere />, name: "Swipe row, media={null}"}
export const Select: StoryObj = {render: () => <SelectExample />}
export const TouchTargets: StoryObj = {render: () => <TouchTargetsExample />, name: "Touch targets (compact)"}
export const CompactDrawer: StoryObj = {render: () => <CompactDrawerExample />, name: "Density-aware drawer"}
