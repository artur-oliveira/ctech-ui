"use client"

// Required, and the one file in this package where leaving it out breaks more
// than this file. `createContext` runs at module scope, and the package's entry
// point is a barrel that re-exports everything — so a React Server Component
// importing *any* primitive evaluates this module, and the build fails with
// "You're importing a module that depends on createContext into a React Server
// Component" pointing at the consumer's page rather than at this line.
//
// Every other component here is server-safe and deliberately carries no
// directive: marking them would push work to the client that does not need to
// be there. This one genuinely holds state.

import {createContext, useContext} from "react"
import type {ComponentProps, ReactNode} from "react"

type CTechTheme = "account" | "dfe" | "wallet" | "poker" | "billing" | "auction"
type Density = "comfortable" | "compact"

interface ThemeProviderProps extends ComponentProps<"div"> {
  theme: CTechTheme
  density?: Density
}

interface ThemeScope {
  theme: CTechTheme
  density: Density
}

const ThemeContext = createContext<ThemeScope | null>(null)
/** The nearest DensityScope's density; null outside one, where ThemeProvider's applies. */
const DensityContext = createContext<Density | null>(null)

/** Scopes a product identity without leaking it through component props. */
function ThemeProvider({theme, density = "comfortable", children, ...props}: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{theme, density}}>
      {/* A provider resets any outer DensityScope: its own density wins inside it. */}
      <DensityContext.Provider value={null}>
        <div data-ctech-theme={theme} data-density={density} {...props}>{children}</div>
      </DensityContext.Provider>
    </ThemeContext.Provider>
  )
}

interface DensityScopeProps extends ComponentProps<"div"> {
  density: Density
}

/**
 * A surface with its own density inside a themed app: a compact console in a
 * comfortable product. It writes `data-density` for the controls inside it AND
 * tells portalled overlays opened from inside it (Drawer, Modal, Select, menus),
 * which render outside this element and would otherwise fall back to the
 * provider's density. A compact console therefore gets compact drawers, on a
 * desktop too.
 */
function DensityScope({density, children, ...props}: DensityScopeProps) {
  return (
    <DensityContext.Provider value={density}>
      <div data-density={density} {...props}>{children}</div>
    </DensityContext.Provider>
  )
}

/**
 * Portalled primitives need this because CSS variables do not cross a portal
 * boundary. Consumers normally receive it through ThemeProvider; the fallback
 * makes an isolated primitive render with the default CTech theme as well.
 */
function useThemeScope(): ThemeScope {
  const scope = useContext(ThemeContext) ?? {theme: "account" as const, density: "comfortable" as const}
  const density = useContext(DensityContext)
  return density ? {theme: scope.theme, density} : scope
}

export {DensityScope, ThemeProvider, useThemeScope, type CTechTheme, type DensityScopeProps, type ThemeProviderProps, type Density}
