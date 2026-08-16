import {createContext, useContext} from "react"
import type {ComponentProps, ReactNode} from "react"

type CTechTheme = "account" | "dfe" | "wallet" | "poker" | "billing"
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
