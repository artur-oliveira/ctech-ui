import {defineConfig} from "vitest/config"

// Component behaviour (focus, keyboard, ARIA) in jsdom. The pure-logic i18n
// test stays on node:test, so it is not picked up here.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
})
