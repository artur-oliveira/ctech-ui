import type {Meta, StoryObj} from "@storybook/react-vite"

const themes = ["account", "dfe", "wallet", "poker", "billing", "auction"] as const

function ThemeRegistry() {
  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Theme Registry</h1>
        <p className="text-sm text-muted-foreground">Cada produto mapeia a mesma semântica a uma identidade própria. Estados de sucesso, atenção e urgência não mudam de significado.</p>
      </header>
      <div className="relative overflow-x-auto rounded-xl border border-border after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-linear-to-l after:from-background after:to-transparent sm:after:hidden">
        <table className="w-full min-w-185 text-left text-sm" aria-label="Comparação dos temas oficiais CTech">
          <caption className="sr-only">Cada linha mostra como uma marca aplica o mesmo contrato de cor semântica.</caption>
          <colgroup><col className="w-[32%]" /><col className="w-[18%]" /><col className="w-[22%]" /><col className="w-[28%]" /></colgroup>
          <thead className="bg-surface text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Produto</th><th className="px-4 py-3 font-medium">Marca</th><th className="px-4 py-3 font-medium">Superfície</th><th className="px-4 py-3 font-medium">Estados</th></tr></thead>
          <tbody>
            {themes.map(theme => <ThemeRow key={theme} theme={theme} />)}
          </tbody>
        </table>
      </div>
      <section className="grid gap-4 border-t border-border pt-6 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div><h2 className="text-base font-semibold">Herança de tokens</h2><p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">Core define escala e movimento. Semântica define intenção. Componentes consomem apenas intenção; por isso trocar o tema não bifurca comportamento.</p></div>
        <ol className="grid gap-2 text-sm"><li><code>core</code> — espaço, raio, movimento</li><li><code>semantic</code> — ação, superfície, foco, estado</li><li><code>component</code> — Button, Input, Dialog</li></ol>
      </section>
    </main>
  )
}

function ThemeRow({theme}: {theme: typeof themes[number]}) {
  return <tr data-ctech-theme={theme} className="border-t border-border"><td className="px-4 py-4 font-medium capitalize">{theme}</td><td className="px-4 py-4"><span className="inline-block size-6 rounded-md bg-brand-600" aria-label={`Marca ${theme}`} /></td><td className="px-4 py-4"><span className="inline-block size-6 rounded-md border border-border bg-surface" /></td><td className="px-4 py-4"><div className="flex gap-2"><span className="size-3 rounded-full bg-success" /><span className="size-3 rounded-full bg-warning" /><span className="size-3 rounded-full bg-danger" /></div></td></tr>
}

const meta = {title: "Foundations/Theme Registry", component: ThemeRegistry} satisfies Meta<typeof ThemeRegistry>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
