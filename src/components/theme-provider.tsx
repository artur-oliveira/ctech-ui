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

/** Scopes a product identity without leaking it through component props. */
function ThemeProvider({theme, density = "comfortable", children, ...props}: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{theme, density}}>
      <div data-ctech-theme={theme} data-density={density} {...props}>{children}</div>
    </ThemeContext.Provider>
  )
}

/**
 * Portalled primitives need this because CSS variables do not cross a portal
 * boundary. Consumers normally receive it through ThemeProvider; the fallback
 * makes an isolated primitive render with the default CTech theme as well.
 */
function useThemeScope(): ThemeScope {
  return useContext(ThemeContext) ?? {theme: "account", density: "comfortable"}
}

export {ThemeProvider, useThemeScope, type CTechTheme, type ThemeProviderProps, type Density}
