import {useState} from "react"
import type {Meta, StoryObj} from "@storybook/react-vite"
import {Alert as AlertComponent} from "./components/alert"
import {Badge as BadgeComponent} from "./components/badge"
import {Button as ButtonComponent} from "./components/button"
import {Checkbox as CheckboxComponent} from "./components/checkbox"
import {DatePicker as DatePickerComponent} from "./components/date-picker"
import {Field as FieldComponent} from "./components/field"
import {Input as InputComponent} from "./components/input"
import {EmptyState as EmptyStateComponent} from "./components/empty-state"
import {Modal as ModalComponent} from "./components/modal"
import {Drawer as DrawerComponent} from "./components/drawer"
import {PageHeader as PageHeaderComponent} from "./components/page-header"
import {Separator as SeparatorComponent} from "./components/separator"
import {Skeleton as SkeletonComponent} from "./components/skeleton"
import {Radio as RadioComponent, RadioGroup as RadioGroupComponent} from "./components/radio"
import {Switch as SwitchComponent} from "./components/switch"
import {ThemeProvider as ThemeProviderComponent} from "./components/theme-provider"

function StateCoverage() {
  return <main className="mx-auto max-w-5xl space-y-10"><header><h1 className="text-2xl font-semibold tracking-[-0.02em]">Component states</h1><p className="mt-2 text-sm text-muted-foreground">Os mesmos contratos de estado, foco e densidade em todos os temas.</p></header><section className="space-y-4"><h2 className="text-base font-semibold">Ações</h2><div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap"><ButtonComponent>Continuar</ButtonComponent><ButtonComponent variant="outline">Secundária</ButtonComponent><ButtonComponent variant="ghost">Neutra</ButtonComponent><ButtonComponent variant="danger">Excluir</ButtonComponent><ButtonComponent disabled>Indisponível</ButtonComponent></div></section><section className="grid gap-6 md:grid-cols-2"><FieldComponent label="E-mail" htmlFor="email" hint="Usaremos apenas para contato."><InputComponent id="email" type="email" placeholder="nome@empresa.com" /></FieldComponent><FieldComponent label="Código fiscal" htmlFor="code" error="Informe um código válido."><InputComponent id="code" aria-invalid="true" aria-describedby="code-error" defaultValue="ABC" /></FieldComponent></section><section className="space-y-4"><h2 className="text-base font-semibold">Feedback</h2><div className="flex flex-wrap gap-2"><BadgeComponent tone="neutral">Pendente</BadgeComponent><BadgeComponent tone="positive">Concluído</BadgeComponent><BadgeComponent tone="attention">Atenção</BadgeComponent><BadgeComponent tone="urgent">Urgente</BadgeComponent></div><AlertComponent tone="success" title="Alterações salvas">Sua configuração foi atualizada.</AlertComponent></section></main>
}

function PageHeaderExample() {
  return <main className="mx-auto max-w-5xl"><PageHeaderComponent lead={<a className="text-sm text-brand-600 hover:underline" href="#back">← Voltar para faturas</a>} title="Fatura #CT-1042" description="Revise os dados e confirme a emissão desta fatura." action={<ButtonComponent>Emitir fatura</ButtonComponent>} /></main>
}

function EmptyStateExample() {
  return <main className="mx-auto max-w-5xl"><EmptyStateComponent title="Nenhuma fatura encontrada" description="Quando uma nova fatura for criada, ela aparecerá nesta lista." action={<ButtonComponent>Criar fatura</ButtonComponent>} /></main>
}

function SkeletonExample() {
  return <main className="mx-auto max-w-5xl space-y-4" aria-label="Exemplo de carregamento"><SkeletonComponent className="h-5 w-40" /><SkeletonComponent className="h-11 w-full max-w-xl" /><SkeletonComponent className="h-24 w-full" /></main>
}

function SeparatorExample() {
  return <main className="mx-auto grid max-w-5xl gap-6"><div className="space-y-3"><p className="text-sm font-medium">Configurações da conta</p><SeparatorComponent /><p className="text-sm text-muted-foreground">Atualize os dados que identificam sua organização.</p></div><div className="flex h-14 items-center gap-4"><span className="text-sm">Resumo</span><SeparatorComponent orientation="vertical" /><span className="text-sm text-muted-foreground">Atividade</span></div></main>
}

function ModalExample({initialOpen = false}: {initialOpen?: boolean}) {
  const [open, setOpen] = useState(initialOpen)
  return <main className="mx-auto max-w-5xl"><ButtonComponent onClick={() => setOpen(true)}>Abrir confirmação</ButtonComponent><ModalComponent open={open} onClose={() => setOpen(false)} title="Emitir esta fatura?" description="A emissão não poderá ser desfeita." onSubmit={() => setOpen(false)} submitLabel="Emitir"><p className="text-sm text-muted-foreground">Confirme os dados antes de disponibilizar a fatura ao cliente.</p></ModalComponent></main>
}

function SelectionControlsExample() {
  return <main className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3"><section className="space-y-3"><h2 className="text-base font-semibold">Checkbox</h2><label className="flex min-h-11 items-center gap-3 text-sm"><CheckboxComponent defaultChecked />Receber resumo semanal</label><label className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground"><CheckboxComponent disabled />Opção indisponível</label></section><section className="space-y-3"><h2 className="text-base font-semibold">Radio</h2><RadioGroupComponent defaultValue="monthly" aria-label="Periodicidade"><label className="flex min-h-11 items-center gap-3 text-sm"><RadioComponent value="monthly" />Mensal</label><label className="flex min-h-11 items-center gap-3 text-sm"><RadioComponent value="annual" />Anual</label></RadioGroupComponent></section><section className="space-y-3"><h2 className="text-base font-semibold">Switch</h2><label className="flex min-h-11 items-center justify-between gap-3 text-sm"><span><span className="block font-medium">Notificações</span><span className="text-muted-foreground">Alertas importantes por e-mail</span></span><SwitchComponent defaultChecked aria-label="Ativar notificações" /></label></section></main>
}

function DatePickerExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 16))
  return <main className="mx-auto max-w-sm space-y-2"><label htmlFor="invoice-date" className="text-sm font-medium">Data de emissão</label><DatePickerComponent id="invoice-date" name="issuedAt" value={date} onValueChange={setDate} min={new Date(2026, 0, 1)} defaultOpen /></main>
}

function ThemeProviderExample() {
  return <main className="mx-auto max-w-5xl space-y-4"><p className="max-w-[65ch] text-sm text-muted-foreground">O provider aplica identidade e densidade ao escopo dos componentes, sem transportar a marca por props individuais.</p><ThemeProviderComponent theme="billing" density="compact" className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"><span className="text-sm font-medium">Fatura CT-1042</span><ButtonComponent size="sm">Ver detalhes</ButtonComponent></ThemeProviderComponent></main>
}

const meta = {title: "Components/State coverage", component: StateCoverage} satisfies Meta<typeof StateCoverage>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {name: "Visão geral"}

export const Button: StoryObj = {render: () => <main className="mx-auto flex max-w-5xl flex-wrap gap-3"><ButtonComponent>Continuar</ButtonComponent><ButtonComponent variant="outline">Secundária</ButtonComponent><ButtonComponent variant="ghost">Neutra</ButtonComponent><ButtonComponent variant="danger">Excluir</ButtonComponent></main>}
export const Badge: StoryObj = {render: () => <main className="mx-auto flex max-w-5xl flex-wrap gap-2"><BadgeComponent tone="neutral">Pendente</BadgeComponent><BadgeComponent tone="positive">Concluído</BadgeComponent><BadgeComponent tone="attention">Atenção</BadgeComponent><BadgeComponent tone="urgent">Urgente</BadgeComponent></main>}
export const Alert: StoryObj = {render: () => <main className="mx-auto grid max-w-5xl gap-3"><AlertComponent tone="info" title="Informação">Uma atualização está disponível.</AlertComponent><AlertComponent tone="success" title="Alterações salvas">Sua configuração foi atualizada.</AlertComponent><AlertComponent tone="warning" title="Atenção">Revise os dados antes de continuar.</AlertComponent><AlertComponent tone="danger" title="Não foi possível concluir">Tente novamente em instantes.</AlertComponent></main>}
export const FieldAndInput: StoryObj = {render: () => <main className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2"><FieldComponent label="E-mail" htmlFor="story-email" hint="Usaremos apenas para contato."><InputComponent id="story-email" type="email" placeholder="nome@empresa.com" /></FieldComponent><FieldComponent label="Código fiscal" htmlFor="story-code" error="Informe um código válido."><InputComponent id="story-code" aria-invalid="true" aria-describedby="story-code-error" defaultValue="ABC" /></FieldComponent></main>, name: "Field & Input"}

export const PageHeader: StoryObj = {render: () => <PageHeaderExample />, name: "Page Header"}
export const EmptyState: StoryObj = {render: () => <EmptyStateExample />, name: "Empty State"}
export const Skeleton: StoryObj = {render: () => <SkeletonExample />}
export const Separator: StoryObj = {render: () => <SeparatorExample />}
export const Modal: StoryObj = {render: () => <ModalExample initialOpen />}
export const SelectionControls: StoryObj = {render: () => <SelectionControlsExample />, name: "Checkbox, Radio & Switch"}
export const DatePicker: StoryObj = {render: () => <DatePickerExample />, name: "Date Picker"}
export const ThemeProvider: StoryObj = {render: () => <ThemeProviderExample />}

function DrawerExample() {
  const [open, setOpen] = useState(true)
  return <main className="mx-auto max-w-5xl"><ButtonComponent onClick={() => setOpen(true)}>Nova conta</ButtonComponent><DrawerComponent open={open} onClose={() => setOpen(false)} title="Nova conta a pagar" description="Registre o vencimento para acompanhar."><p className="text-sm text-muted-foreground">O formulário fica aqui, com os próprios botões.</p></DrawerComponent></main>
}

export const Drawer: StoryObj = {render: () => <DrawerExample />}
