// Gera as imagens placeholder locais (SVG) usadas pelos seeds.
// Uso: node scripts/gerar-imagens.mjs
// Escala dos padrões: 20 px = 1 cm (a amostra de 1200 px representa 60 cm × 60 cm).
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "img")
const PX = 20 // px por cm

function salvar(caminho, svg) {
  const destino = join(raiz, caminho)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, svg.replace(/\n\s*/g, "\n").trim() + "\n")
}

// Gerador pseudoaleatório determinístico (para texturas iguais a cada execução)
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const c = (cm) => +(cm * PX).toFixed(2)

// ---------- Padrões: cada um retorna { w, h, body } em px (20 px/cm) ----------

function listrado({ base, listra, linha }) {
  const w = c(10)
  return {
    w,
    h: c(10),
    body: `<rect width="${w}" height="${c(10)}" fill="${base}"/>
      <rect x="0" width="${c(5)}" height="${c(10)}" fill="${listra}"/>
      <rect x="${c(5) - 2}" width="2" height="${c(10)}" fill="${linha}" opacity=".35"/>`,
  }
}

function listradoRiviera({ base, listra }) {
  const w = c(14)
  return {
    w,
    h: c(10),
    body: `<rect width="${w}" height="${c(10)}" fill="${base}"/>
      <rect x="0" width="${c(6)}" height="${c(10)}" fill="${listra}"/>
      <rect x="${c(8)}" width="${c(1)}" height="${c(10)}" fill="${listra}"/>
      <rect x="${c(10.5)}" width="${c(1)}" height="${c(10)}" fill="${listra}"/>`,
  }
}

function vichy({ base, cor }) {
  const q = c(10)
  return {
    w: q * 2,
    h: q * 2,
    body: `<rect width="${q * 2}" height="${q * 2}" fill="${base}"/>
      <rect x="0" y="0" width="${q}" height="${q * 2}" fill="${cor}" opacity=".45"/>
      <rect x="0" y="0" width="${q * 2}" height="${q}" fill="${cor}" opacity=".45"/>`,
  }
}

function gradeFina({ base, linha }) {
  const q = c(10)
  const e = c(0.3)
  return {
    w: q,
    h: q,
    body: `<rect width="${q}" height="${q}" fill="${base}"/>
      <rect x="0" y="0" width="${e}" height="${q}" fill="${linha}"/>
      <rect x="0" y="0" width="${q}" height="${e}" fill="${linha}"/>`,
  }
}

function borboleta(x, y, tam, rot, cor, corEscura) {
  const s = tam / 100
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 -6 C -20 -55, -62 -48, -52 -12 C -46 6, -18 6, 0 -2 Z" fill="${cor}"/>
    <path d="M0 -6 C 20 -55, 62 -48, 52 -12 C 46 6, 18 6, 0 -2 Z" fill="${cor}"/>
    <path d="M0 0 C -14 6, -42 14, -34 36 C -26 52, -8 30, 0 6 Z" fill="${cor}" opacity=".8"/>
    <path d="M0 0 C 14 6, 42 14, 34 36 C 26 52, 8 30, 0 6 Z" fill="${cor}" opacity=".8"/>
    <path d="M-30 -24 C -36 -30, -40 -22, -32 -18" fill="none" stroke="${corEscura}" stroke-width="3" opacity=".5"/>
    <path d="M30 -24 C 36 -30, 40 -22, 32 -18" fill="none" stroke="${corEscura}" stroke-width="3" opacity=".5"/>
    <rect x="-3" y="-22" width="6" height="52" rx="3" fill="${corEscura}"/>
    <path d="M-2 -22 C -8 -36, -14 -42, -20 -46 M2 -22 C 8 -36, 14 -42, 20 -46" fill="none" stroke="${corEscura}" stroke-width="2.5"/>
  </g>`
}

function borboletas({ base, cor, escura }) {
  const t = c(20)
  return {
    w: t,
    h: t,
    body: `<rect width="${t}" height="${t}" fill="${base}"/>
      ${borboleta(c(5), c(5), c(6), -14, cor, escura)}
      ${borboleta(c(15), c(15), c(6), 18, cor, escura)}
      ${borboleta(c(15), c(4.5), c(3), 30, cor, escura)}
      ${borboleta(c(5), c(15.5), c(3), -28, cor, escura)}`,
  }
}

function flor(x, y, r, petala, miolo) {
  const petalas = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180
    return `<ellipse cx="${(x + Math.sin(a) * r * 0.55).toFixed(1)}" cy="${(y - Math.cos(a) * r * 0.55).toFixed(1)}" rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.52).toFixed(1)}" transform="rotate(${i * 72} ${(x + Math.sin(a) * r * 0.55).toFixed(1)} ${(y - Math.cos(a) * r * 0.55).toFixed(1)})" fill="${petala}"/>`
  }).join("")
  return `${petalas}<circle cx="${x}" cy="${y}" r="${(r * 0.26).toFixed(1)}" fill="${miolo}"/>`
}

function folha(x, y, tam, rot, cor) {
  return `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0 C ${tam * 0.35} ${-tam * 0.3}, ${tam * 0.75} ${-tam * 0.25}, ${tam} 0 C ${tam * 0.75} ${tam * 0.25}, ${tam * 0.35} ${tam * 0.3}, 0 0 Z" fill="${cor}"/>`
}

function floralJardim({ base, petala, miolo, folhaCor }) {
  const t = c(24)
  return {
    w: t,
    h: t,
    body: `<rect width="${t}" height="${t}" fill="${base}"/>
      ${folha(c(4), c(7), c(5), -30, folhaCor)}${folha(c(7), c(8), c(4.5), 40, folhaCor)}
      ${flor(c(6), c(6), c(3.4), petala, miolo)}
      ${folha(c(16), c(19), c(5), 150, folhaCor)}${folha(c(18), c(18), c(4.5), -20, folhaCor)}
      ${flor(c(18), c(18), c(3.4), petala, miolo)}
      ${flor(c(18), c(5), c(1.6), petala, miolo)}
      ${flor(c(5), c(18), c(1.6), petala, miolo)}
      ${folha(c(11), c(12), c(2.5), 70, folhaCor)}`,
  }
}

function arabesco({ base, cor }) {
  // Treliça ogival clássica, 16 cm × 24 cm
  const w = c(16)
  const h = c(24)
  const e = c(0.55)
  const losango = (x, y, r) => `<path d="M${x} ${y - r} L ${x + r * 0.7} ${y} L ${x} ${y + r} L ${x - r * 0.7} ${y} Z" fill="${cor}"/>`
  const ponto = (x, y) =>
    [0, 90, 180, 270]
      .map((a) => `<ellipse cx="${x}" cy="${y - c(0.9)}" rx="${c(0.45)}" ry="${c(0.9)}" transform="rotate(${a} ${x} ${y})" fill="${cor}" opacity=".7"/>`)
      .join("")
  return {
    w,
    h,
    body: `<rect width="${w}" height="${h}" fill="${base}"/>
      <path d="M${w / 2} 0 C ${w / 2} ${h * 0.25}, 0 ${h * 0.25}, 0 ${h / 2} C 0 ${h * 0.75}, ${w / 2} ${h * 0.75}, ${w / 2} ${h}" fill="none" stroke="${cor}" stroke-width="${e}"/>
      <path d="M${w / 2} 0 C ${w / 2} ${h * 0.25}, ${w} ${h * 0.25}, ${w} ${h / 2} C ${w} ${h * 0.75}, ${w / 2} ${h * 0.75}, ${w / 2} ${h}" fill="none" stroke="${cor}" stroke-width="${e}"/>
      ${losango(w / 2, 0, c(1.4))}${losango(w / 2, h, c(1.4))}${losango(0, h / 2, c(1.4))}${losango(w, h / 2, c(1.4))}
      ${ponto(w / 2, h / 2)}${ponto(0, 0)}${ponto(w, 0)}${ponto(0, h)}${ponto(w, h)}`,
  }
}

function nuvem(x, y, s, cor) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${cor}">
    <circle cx="-34" cy="6" r="22"/><circle cx="-6" cy="-10" r="30"/><circle cx="28" cy="2" r="24"/>
    <rect x="-56" y="6" width="108" height="22" rx="11"/></g>`
}

function estrela(x, y, r, cor) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 * Math.PI) / 180
    const rr = i % 2 === 0 ? r : r * 0.45
    return `${(x + Math.sin(a) * rr).toFixed(1)},${(y - Math.cos(a) * rr).toFixed(1)}`
  }).join(" ")
  return `<polygon points="${pts}" fill="${cor}"/>`
}

function nuvens({ base, nuvemCor, estrelaCor }) {
  const t = c(24)
  return {
    w: t,
    h: t,
    body: `<rect width="${t}" height="${t}" fill="${base}"/>
      ${nuvem(c(6), c(6), 1.7, nuvemCor)}${nuvem(c(18), c(17), 1.4, nuvemCor)}
      ${estrela(c(17), c(5), c(1), estrelaCor)}${estrela(c(5), c(17), c(0.8), estrelaCor)}
      ${estrela(c(11), c(12), c(0.6), estrelaCor)}${estrela(c(22), c(10), c(0.5), estrelaCor)}`,
  }
}

function arcoIris(x, y, r, cores) {
  const faixa = r / (cores.length + 1)
  return cores
    .map((cor, i) => {
      const ro = r - i * faixa
      const ri = ro - faixa
      return `<path d="M${x - ro} ${y} A ${ro} ${ro} 0 0 1 ${x + ro} ${y} L ${x + ri} ${y} A ${ri} ${ri} 0 0 0 ${x - ri} ${y} Z" fill="${cor}"/>`
    })
    .join("")
}

function arcosIris({ base, cores }) {
  const t = c(20)
  return {
    w: t,
    h: t,
    body: `<rect width="${t}" height="${t}" fill="${base}"/>
      ${arcoIris(c(5), c(8), c(4), cores)}${arcoIris(c(15), c(18), c(4), cores)}
      <circle cx="${c(15)}" cy="${c(6)}" r="${c(0.6)}" fill="${cores[0]}"/>
      <circle cx="${c(5)}" cy="${c(15)}" r="${c(0.6)}" fill="${cores[1]}"/>`,
  }
}

function linho({ base, fio }, seed) {
  const t = c(12)
  const r = rng(seed)
  let linhas = ""
  for (let i = 0; i < 70; i++) {
    const y = (r() * t).toFixed(1)
    linhas += `<rect x="0" y="${y}" width="${t}" height="${(1 + r() * 2).toFixed(1)}" fill="${fio}" opacity="${(0.08 + r() * 0.16).toFixed(2)}"/>`
    const x = (r() * t).toFixed(1)
    linhas += `<rect x="${x}" y="0" width="${(1 + r() * 2).toFixed(1)}" height="${t}" fill="${fio}" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`
  }
  return { w: t, h: t, body: `<rect width="${t}" height="${t}" fill="${base}"/>${linhas}` }
}

function palha({ base, trama }) {
  // Trançado de cesto: blocos de 2 cm alternando fios horizontais e verticais
  const b = c(2)
  const fio = b / 3
  const bloco = (x, y, horizontal) =>
    Array.from({ length: 3 }, (_, i) =>
      horizontal
        ? `<rect x="${x + 2}" y="${y + i * fio + 2}" width="${b - 4}" height="${fio - 4}" rx="4" fill="${trama}" opacity="${0.45 + i * 0.12}"/>`
        : `<rect x="${x + i * fio + 2}" y="${y + 2}" width="${fio - 4}" height="${b - 4}" rx="4" fill="${trama}" opacity="${0.45 + i * 0.12}"/>`,
    ).join("")
  return {
    w: b * 2,
    h: b * 2,
    body: `<rect width="${b * 2}" height="${b * 2}" fill="${base}"/>
      ${bloco(0, 0, true)}${bloco(b, 0, false)}${bloco(0, b, false)}${bloco(b, b, true)}`,
  }
}

function liso({ base, ponto }, seed) {
  const t = c(6)
  const r = rng(seed)
  let pontos = ""
  for (let i = 0; i < 160; i++) {
    pontos += `<circle cx="${(r() * t).toFixed(1)}" cy="${(r() * t).toFixed(1)}" r="${(0.6 + r()).toFixed(1)}" fill="${ponto}" opacity="${(0.08 + r() * 0.12).toFixed(2)}"/>`
  }
  return { w: t, h: t, body: `<rect width="${t}" height="${t}" fill="${base}"/>${pontos}` }
}

// ---------- Catálogo de padrões (slug do produto → cores) ----------

export const PADROES = {
  "listrado-classico": {
    azul: listrado({ base: "#F5F1E8", listra: "#8EAAC4", linha: "#5D7A96" }),
    rosa: listrado({ base: "#F7F0EB", listra: "#E2B3B4", linha: "#B07F80" }),
  },
  "listrado-riviera": {
    salvia: listradoRiviera({ base: "#F4F0E6", listra: "#9DAE98" }),
    areia: listradoRiviera({ base: "#F6F1E7", listra: "#CDB894" }),
  },
  "xadrez-vichy": {
    azul: vichy({ base: "#F7F4EC", cor: "#5F84AA" }),
    verde: vichy({ base: "#F7F4EC", cor: "#6E8A6A" }),
    terracota: vichy({ base: "#F8F2EA", cor: "#B86F52" }),
  },
  "grade-fina": {
    grafite: gradeFina({ base: "#F4F1EA", linha: "#55524D" }),
    areia: gradeFina({ base: "#F6F2EA", linha: "#C2AE8C" }),
  },
  borboletas: {
    azul: borboletas({ base: "#F6F2EA", cor: "#7E9CC0", escura: "#3F5875" }),
    lilas: borboletas({ base: "#F6F2EC", cor: "#A894C4", escura: "#5E4E78" }),
  },
  "floral-jardim": {
    rosa: floralJardim({ base: "#F7F2EA", petala: "#D9A1A3", miolo: "#C58A4E", folhaCor: "#8DA286" }),
    verde: floralJardim({ base: "#EEF0E6", petala: "#F3E7CF", miolo: "#C9A35A", folhaCor: "#6F8768" }),
  },
  "arabesco-imperial": {
    dourado: arabesco({ base: "#F3EEE3", cor: "#C3A774" }),
    cinza: arabesco({ base: "#EEEDEA", cor: "#A3A19C" }),
  },
  "nuvens-e-estrelas": {
    azul: nuvens({ base: "#CCDCEA", nuvemCor: "#FBFAF7", estrelaCor: "#E9C873" }),
    rosa: nuvens({ base: "#F1D7D7", nuvemCor: "#FBFAF7", estrelaCor: "#E2B864" }),
  },
  "arco-iris": {
    terracota: arcosIris({ base: "#F8F3EA", cores: ["#C47F62", "#E0B07A", "#9FB09A"] }),
    pastel: arcosIris({ base: "#F8F4EE", cores: ["#E3A9A9", "#F0D29A", "#A9C3D8"] }),
  },
  "texturizado-linho": {
    branco: linho({ base: "#F8F7F3", fio: "#8C8678" }, 11),
    "off-white": linho({ base: "#EFE8DA", fio: "#8A7C62" }, 12),
  },
  "texturizado-palha": {
    "off-white": palha({ base: "#EFE9DC", trama: "#CFC2A6" }),
    areia: palha({ base: "#E3D6BD", trama: "#B9A47F" }),
  },
  "liso-fosco": {
    branco: liso({ base: "#F9F8F5", ponto: "#9A958A" }, 21),
    "off-white": liso({ base: "#F1EADF", ponto: "#93876F" }, 22),
  },
}

function amostra({ w, h, body }) {
  // 60 cm × 60 cm
  const lado = c(60)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
    <defs><pattern id="p" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern></defs>
    <rect width="${lado}" height="${lado}" fill="url(#p)"/></svg>`
}

// ---------- Cena de ambiente (parede com papel + móveis) ----------

const W = 1600
const H = 1100
const PISO = 820

function moveis(tipo) {
  const sombra = `<ellipse cx="800" cy="${PISO + 30}" rx="560" ry="22" fill="#000" opacity=".08"/>`
  if (tipo === "cama") {
    return `${sombra}
      <rect x="430" y="470" width="740" height="300" rx="6" fill="#D8CBB6"/>
      <rect x="430" y="470" width="740" height="18" fill="#C9B9A1"/>
      <rect x="400" y="690" width="800" height="150" rx="6" fill="#F2EEE6"/>
      <rect x="400" y="690" width="800" height="26" fill="#E6DFD3"/>
      <rect x="470" y="610" width="200" height="90" rx="20" fill="#FBF9F5"/>
      <rect x="930" y="610" width="200" height="90" rx="20" fill="#FBF9F5"/>
      <rect x="700" y="760" width="500" height="80" fill="#B9A27E" opacity=".75"/>
      <rect x="1220" y="640" width="140" height="200" fill="#A57F5A"/>
      <rect x="1220" y="640" width="140" height="14" fill="#8E6B4A"/>
      <path d="M1290 640 L1265 560 L1315 560 Z" fill="#EFE6D6"/><rect x="1286" y="560" width="8" height="80" fill="#6E5640"/>`
  }
  if (tipo === "sofa") {
    return `${sombra}
      <rect x="360" y="600" width="880" height="200" rx="18" fill="#8E9A8A"/>
      <rect x="320" y="640" width="90" height="190" rx="18" fill="#7F8B7B"/>
      <rect x="1190" y="640" width="90" height="190" rx="18" fill="#7F8B7B"/>
      <rect x="410" y="700" width="780" height="110" rx="12" fill="#9AA696"/>
      <rect x="440" y="610" width="230" height="120" rx="14" fill="#A8B3A4"/>
      <rect x="930" y="610" width="230" height="120" rx="14" fill="#A8B3A4"/>
      <rect x="560" y="640" width="120" height="90" rx="10" fill="#E4D2B8"/>
      <rect x="380" y="826" width="14" height="20" fill="#5B4636"/><rect x="1206" y="826" width="14" height="20" fill="#5B4636"/>
      <rect x="1330" y="430" width="10" height="410" fill="#3C3A36"/>
      <path d="M1335 430 L1290 360 L1380 360 Z" fill="#EDE5D6"/>`
  }
  return `${sombra}
    <rect x="480" y="640" width="640" height="170" rx="4" fill="#9C7756"/>
    <rect x="480" y="640" width="640" height="16" fill="#86644A"/>
    <line x1="800" y1="660" x2="800" y2="806" stroke="#7A5B41" stroke-width="3"/>
    <rect x="520" y="806" width="14" height="30" fill="#5B4636"/><rect x="1066" y="806" width="14" height="30" fill="#5B4636"/>
    <path d="M600 640 C 590 600, 600 570, 620 560 L 660 560 C 680 570, 690 600, 680 640 Z" fill="#E7DFD1"/>
    <path d="M640 560 C 620 480, 560 430, 520 400 M640 560 C 650 470, 690 420, 720 380 M640 560 C 630 500, 600 460, 610 420" fill="none" stroke="#5E6B55" stroke-width="5"/>
    <ellipse cx="530" cy="410" rx="20" ry="9" fill="#7E8E73" transform="rotate(-30 530 410)"/>
    <ellipse cx="710" cy="392" rx="20" ry="9" fill="#7E8E73" transform="rotate(30 710 392)"/>
    <ellipse cx="612" cy="430" rx="18" ry="8" fill="#7E8E73" transform="rotate(-70 612 430)"/>
    <ellipse cx="575" cy="470" rx="18" ry="8" fill="#8D9C80" transform="rotate(-20 575 470)"/>
    <rect x="960" y="540" width="10" height="100" fill="#3C3A36"/>
    <path d="M965 540 L915 470 L1015 470 Z" fill="#EDE5D6"/>
    <rect x="780" y="600" width="120" height="40" fill="#D9CDB8"/><rect x="790" y="590" width="100" height="12" fill="#C3B190"/>`
}

function ambiente({ padrao, moveisTipo = "aparador", paredeLisa }) {
  const escala = 3.2 / PX // 3,2 px por cm na cena
  const parede = paredeLisa
    ? `<rect width="${W}" height="${PISO}" fill="${paredeLisa}"/>`
    : `<rect width="${W}" height="${PISO}" fill="url(#p)"/>`
  let tabuas = ""
  for (let x = -40; x < W; x += 190) tabuas += `<line x1="${x}" y1="${PISO + 20}" x2="${x + 60}" y2="${H}" stroke="#9B7F5F" stroke-width="2" opacity=".5"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      ${padrao ? `<pattern id="p" width="${padrao.w}" height="${padrao.h}" patternUnits="userSpaceOnUse" patternTransform="scale(${escala})">${padrao.body}</pattern>` : ""}
      <linearGradient id="luz" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0" stop-color="#FFF8EC" stop-opacity=".28"/><stop offset=".6" stop-color="#FFF8EC" stop-opacity="0"/><stop offset="1" stop-color="#3B2F22" stop-opacity=".10"/>
      </linearGradient>
    </defs>
    ${parede}
    <rect width="${W}" height="${PISO}" fill="url(#luz)"/>
    <rect y="${PISO}" width="${W}" height="${H - PISO}" fill="#BFA07C"/>
    ${tabuas}
    <rect y="${PISO - 4}" width="${W}" height="24" fill="#F3EFE7"/>
    <rect y="${PISO + 20}" width="${W}" height="4" fill="#000" opacity=".06"/>
    ${moveis(moveisTipo)}
  </svg>`
}

// ---------- Gera tudo ----------

for (const [slug, cores] of Object.entries(PADROES)) {
  for (const [cor, padrao] of Object.entries(cores)) {
    salvar(`produtos/${slug}-${cor}.svg`, amostra(padrao))
  }
  const [primeiro] = Object.values(cores)
  const tipo = /nuvens|arco/.test(slug) ? "cama" : /listrado|linho|liso|grade/.test(slug) ? "sofa" : "aparador"
  salvar(`produtos/${slug}-ambiente.svg`, ambiente({ padrao: primeiro, moveisTipo: tipo }))
}

salvar("home/hero.svg", ambiente({ padrao: PADROES["floral-jardim"].verde, moveisTipo: "aparador" }))
salvar("home/medir.svg", ambiente({ padrao: PADROES["listrado-classico"].azul, moveisTipo: "sofa" }))

const trabalhos = [
  { id: "sala-listrada", padrao: PADROES["listrado-classico"].azul, moveis: "sofa", antes: "#E4DED2" },
  { id: "quarto-infantil", padrao: PADROES["nuvens-e-estrelas"].azul, moveis: "cama", antes: "#E8E2D6" },
  { id: "hall-arabesco", padrao: PADROES["arabesco-imperial"].dourado, moveis: "aparador", antes: "#DDD6C9" },
  { id: "quarto-floral", padrao: PADROES["floral-jardim"].rosa, moveis: "cama", antes: "#E6E0D4" },
]
for (const t of trabalhos) {
  salvar(`trabalhos/${t.id}-antes.svg`, ambiente({ moveisTipo: t.moveis, paredeLisa: t.antes }))
  salvar(`trabalhos/${t.id}-depois.svg`, ambiente({ padrao: t.padrao, moveisTipo: t.moveis }))
}

console.log("Imagens geradas em public/img")
