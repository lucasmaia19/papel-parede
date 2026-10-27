// Converte as fotos reais de papel-fotos/ para WebP em public/img (usadas pelos seeds em lib/data.ts).
// Uso: node scripts/importar-fotos.mjs
// Recorta marcas de outros apps (selo do Pinterest no topo, ícones do Instagram no rodapé).
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const origem = join(raiz, "papel-fotos")
const destino = join(raiz, "public", "img")

/** [arquivo de origem, caminho de destino sem extensão, recorte { topo?, base? } em px] */
const FOTOS = [
  ["Azulejos cozinha.jpeg", "produtos/azulejos-cozinha"],
  ["Cimento queimado Areia.jpeg", "produtos/cimento-queimado-areia"],
  ["Delicado.jpeg", "produtos/delicado"],
  ["Flores Linho.jpeg", "produtos/flores-linho"],
  ["Laços e flores.jpeg", "produtos/lacos-e-flores"],
  ["Linho  Offwhite (pronta entrega).jpeg", "produtos/linho-texturizado-off-white"],
  ["Listra e flores 1.jpeg", "produtos/listra-e-flores-1", { base: 95 }],
  ["Listra e flores 2.jpeg", "produtos/listra-e-flores-2", { base: 95 }],
  ["Madeira fria.jpeg", "produtos/madeira-fria"],
  ["Madeira louro Freijó.jpeg", "produtos/madeira-louro-freijo"],
  ["Ramos E laços.jpeg", "produtos/ramos-e-lacos", { topo: 110 }],
  ["Toile de Jouy.jpeg", "produtos/toile-de-jouy-1"],
  ["Toile de Jouy 2.jpeg", "produtos/toile-de-jouy-2"],
  ["Xadrez 3xm.jpeg", "produtos/xadrez-3cm"],
  ["Xadrez aquarela.jpeg", "produtos/xadrez-aquarela", { topo: 110 }],
  ["trabalho-meu.jpeg", "trabalhos/mural-floral", { base: 95 }],
]

for (const [arquivo, saida, recorte = {}] of FOTOS) {
  const entrada = sharp(join(origem, arquivo))
  const { width, height } = await entrada.metadata()
  const topo = recorte.topo ?? 0
  const altura = height - topo - (recorte.base ?? 0)
  mkdirSync(dirname(join(destino, saida)), { recursive: true })
  await entrada
    .extract({ left: 0, top: topo, width, height: altura })
    .webp({ quality: 70, effort: 6 })
    .toFile(join(destino, `${saida}.webp`))
  console.log(`${saida}.webp  ${width} × ${altura}`)
}
