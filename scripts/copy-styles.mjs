import {cp, mkdir} from "node:fs/promises"

await mkdir("dist", {recursive: true})
await cp("src/styles/styles.css", "dist/styles.css")
await cp("src/styles/themes.css", "dist/themes.css")
await cp("src/styles/tokens.css", "dist/tokens.css")
