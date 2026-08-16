import type {Preview} from "@storybook/react-vite"
import {ThemeProvider} from "../src/components/theme-provider"
import "./preview.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "CTech product theme",
      defaultValue: "account",
      toolbar: {items: ["account", "dfe", "wallet", "poker", "billing"]},
    },
    density: {
      description: "Surface density",
      defaultValue: "comfortable",
      toolbar: {items: ["comfortable", "compact"]},
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeProvider theme={context.globals.theme} density={context.globals.density} className="min-h-screen px-4 py-6 sm:p-10">
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {layout: "fullscreen", controls: {expanded: true}},
}

export default preview
