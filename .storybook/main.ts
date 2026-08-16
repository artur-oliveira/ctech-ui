import type {StorybookConfig} from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: "@storybook/react-vite",
  viteFinal: async config => {
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    // Storybook's React decorator runtime still imports React's default export.
    // Explicit pre-bundling makes Vite provide the CommonJS-to-ESM interop layer
    // consistently in development, including after a dependency cache is rebuilt.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include ?? []), "react", "react-dom"],
    }
    config.resolve = {
      ...config.resolve,
      dedupe: [...(config.resolve?.dedupe ?? []), "react", "react-dom"],
    }
    return config
  },
}

export default config
