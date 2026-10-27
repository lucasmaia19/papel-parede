// Fatia um screenshot longo em partes para revisão visual.
// Uso: node scripts/fatiar-screenshot.mjs <arquivo.png> <pasta-saida> [altura-da-parte]
import { chromium } from "@playwright/test"
import { writeFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import { pathToFileURL } from "node:url"
const [,, arquivo, saida, alturaParte = "2400"] = process.argv
const b = await chromium.launch()
const p = await b.newPage({ deviceScaleFactor: 1 })
const html = resolve(saida, "fatiar.html")
writeFileSync(html, `<body style="margin:0"><img id=i src="${pathToFileURL(resolve(arquivo)).href}" style="display:block"></body>`)
await p.goto(pathToFileURL(html).href)
const { w, h } = await p.evaluate(() => ({ w: i.naturalWidth, h: i.naturalHeight }))
const ap = +alturaParte
await p.setViewportSize({ width: w, height: Math.min(ap, h) })
const nome = basename(arquivo, ".png")
for (let y = 0, n = 1; y < h; y += ap, n++) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y)
  await p.screenshot({ path: resolve(saida, `${nome}-parte${n}.png`) })
}
await b.close()
console.log(nome, w, h, Math.ceil(h / ap), "partes")
