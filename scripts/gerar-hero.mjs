// Gera os placeholders do carrossel da home em public/hero/ (WebP).
// Uso: node scripts/gerar-hero.mjs
// Cada cena é desenhada num "mundo" de 2400 × 1350 e recortada em dois formatos:
//   mobile 4:5 (1080 × 1350, centrado nos móveis; parte de baixo calma para o bloco de texto)
//   desktop 16:7 (2400 × 1050; móveis à direita, lado esquerdo calmo para o texto)
// Trocar pelas fotos reais com os mesmos nomes: slide-{1..5}-mobile.webp e slide-{1..5}-desktop.webp.
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const destino = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "hero")
mkdirSync(destino, { recursive: true })

const MUNDO_W = 2400
const MUNDO_H = 1350
const PISO = 880
const CENTRO_MOVEIS = 1720

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// ---------- Padrões de parede (tile w × h + corpo) ----------

function aquarela() {
  const r = rng(7)
  const t = 260
  let corpo = `<rect width="${t}" height="${t}" fill="#F6EEE8"/>`
  const flor = (x, y, raio, cor) => {
    let p = ""
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 + r() * 20) * (Math.PI / 180)
      p += `<ellipse cx="${(x + Math.cos(a) * raio).toFixed(1)}" cy="${(y + Math.sin(a) * raio).toFixed(1)}" rx="${raio * 0.9}" ry="${raio * 0.62}" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${(x + Math.cos(a) * raio).toFixed(1)} ${(y + Math.sin(a) * raio).toFixed(1)})" fill="${cor}" opacity="${(0.42 + r() * 0.2).toFixed(2)}"/>`
    }
    return p + `<circle cx="${x}" cy="${y}" r="${raio * 0.35}" fill="#D2A77C" opacity=".55"/>`
  }
  const folha = (x, y, rot) =>
    `<ellipse cx="${x}" cy="${y}" rx="22" ry="8" transform="rotate(${rot} ${x} ${y})" fill="#AEBDA5" opacity=".6"/>`
  corpo += folha(70, 112, -30) + folha(108, 120, 25) + folha(200, 238, 40) + folha(236, 226, -20)
  corpo += flor(84, 74, 20, "#E3B7AC") + flor(208, 196, 16, "#D9A9A0") + flor(220, 52, 11, "#EBCFC4")
  return { w: t, h: t, corpo, filtro: true }
}

function nuvens() {
  const t = 300
  const nuvem = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#F7F3EE" opacity=".95"><circle cx="0" cy="0" r="26"/><circle cx="30" cy="-12" r="32"/><circle cx="64" cy="0" r="24"/><rect x="0" y="-4" width="64" height="28" rx="14"/></g>`
  const estrela = (x, y) => `<path d="M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3}Z" fill="#E6CFA0"/>`
  return {
    w: t,
    h: t,
    corpo: `<rect width="${t}" height="${t}" fill="#DCE4EA"/>${nuvem(40, 70, 1)}${nuvem(180, 220, 0.8)}${estrela(220, 60)}${estrela(70, 210)}${estrela(140, 140)}`,
  }
}

function listras() {
  const t = 120
  return {
    w: t,
    h: t,
    corpo: `<rect width="${t}" height="${t}" fill="#F6EEE9"/><rect x="0" width="44" height="${t}" fill="#E8CFC6"/><rect x="50" width="3" height="${t}" fill="#DDBDB1"/>`,
  }
}

function ramos() {
  const t = 220
  const ramo = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})" stroke="#A8B79F" stroke-width="2.4" fill="none"><path d="M0 0 C 6 -22, 4 -44, 0 -64"/><ellipse cx="-9" cy="-22" rx="10" ry="4.5" transform="rotate(-35 -9 -22)" fill="#B9C6B1" stroke="none"/><ellipse cx="9" cy="-36" rx="10" ry="4.5" transform="rotate(35 9 -36)" fill="#B9C6B1" stroke="none"/><ellipse cx="-6" cy="-52" rx="9" ry="4" transform="rotate(-40 -6 -52)" fill="#B9C6B1" stroke="none"/></g>`
  return { w: t, h: t, corpo: `<rect width="${t}" height="${t}" fill="#E4EAE0"/>${ramo(60, 100, -12)}${ramo(170, 210, 14)}` }
}

function linho() {
  const t = 200
  const r = rng(12)
  let fios = ""
  for (let i = 0; i < 90; i++) {
    fios += `<rect x="0" y="${(r() * t).toFixed(1)}" width="${t}" height="${(1 + r() * 2).toFixed(1)}" fill="#A08B70" opacity="${(0.05 + r() * 0.1).toFixed(2)}"/>`
    fios += `<rect x="${(r() * t).toFixed(1)}" y="0" width="${(1 + r() * 2).toFixed(1)}" height="${t}" fill="#A08B70" opacity="${(0.04 + r() * 0.08).toFixed(2)}"/>`
  }
  return { w: t, h: t, corpo: `<rect width="${t}" height="${t}" fill="#EFE7DB"/>${fios}` }
}

// ---------- Móveis (desenhados em torno de x = 0, chão em y = 0) ----------

const sombra = (largura) => `<ellipse cx="0" cy="18" rx="${largura}" ry="20" fill="#6B5A52" opacity=".08"/>`

function aparador({ extra = "" } = {}) {
  return `${sombra(420)}
    <rect x="-360" y="-250" width="720" height="226" rx="6" fill="#B48F6E"/>
    <rect x="-360" y="-250" width="720" height="18" fill="#A07D5E"/>
    <line x1="0" y1="-226" x2="0" y2="-28" stroke="#957254" stroke-width="3"/>
    <rect x="-330" y="-26" width="16" height="40" fill="#8A6A4F"/><rect x="314" y="-26" width="16" height="40" fill="#8A6A4F"/>
    <path d="M-250 -250 C -262 -300, -250 -330, -228 -342 L -186 -342 C -164 -330, -154 -300, -166 -250 Z" fill="#EDE3D6"/>
    <path d="M-208 -342 C -230 -430, -290 -480, -330 -510 M-208 -342 C -196 -440, -150 -490, -120 -530 M-208 -342 C -218 -410, -246 -450, -236 -490" fill="none" stroke="#8C9A83" stroke-width="5"/>
    <ellipse cx="-322" cy="-500" rx="24" ry="10" fill="#A5B39C" transform="rotate(-30 -322 -500)"/>
    <ellipse cx="-130" cy="-518" rx="24" ry="10" fill="#A5B39C" transform="rotate(30 -130 -518)"/>
    <ellipse cx="-236" cy="-482" rx="22" ry="9" fill="#A5B39C" transform="rotate(-70 -236 -482)"/>
    <ellipse cx="-280" cy="-440" rx="22" ry="9" fill="#B4C1AC" transform="rotate(-20 -280 -440)"/>
    <rect x="180" y="-370" width="12" height="120" fill="#7A6359"/>
    <path d="M186 -370 L 126 -450 L 246 -450 Z" fill="#F1E6DA"/>
    ${extra}`
}

const pinceis = `<rect x="20" y="-330" width="70" height="80" rx="8" fill="#E6D8CB"/>
  <line x1="36" y1="-330" x2="22" y2="-430" stroke="#9C7A62" stroke-width="6"/><circle cx="21" cy="-438" r="9" fill="#D9A9A0"/>
  <line x1="56" y1="-330" x2="60" y2="-450" stroke="#9C7A62" stroke-width="6"/><circle cx="60" cy="-458" r="9" fill="#AEBDA5"/>
  <line x1="74" y1="-330" x2="96" y2="-420" stroke="#9C7A62" stroke-width="6"/><circle cx="98" cy="-428" r="9" fill="#C9D3DC"/>`

const rolos = `<rect x="-20" y="-310" width="200" height="60" rx="30" fill="#E8CFC6"/><ellipse cx="180" cy="-280" rx="16" ry="30" fill="#F4E5DE"/><circle cx="180" cy="-280" r="7" fill="#C9A396"/>
  <circle cx="-80" cy="-275" r="25" fill="#D7C3A8"/><circle cx="-80" cy="-275" r="11" fill="#F4ECE6"/>`

function berco() {
  let grades = ""
  for (let x = -300; x <= 300; x += 50) grades += `<rect x="${x - 6}" y="-420" width="12" height="360" rx="5" fill="#EFE6DC"/>`
  return `${sombra(380)}
    <rect x="-330" y="-440" width="660" height="26" rx="12" fill="#E7DCD0"/>
    ${grades}
    <rect x="-330" y="-120" width="660" height="70" rx="8" fill="#F4ECE6"/>
    <rect x="-310" y="-160" width="620" height="50" rx="20" fill="#E9CFC6"/>
    <rect x="-342" y="-450" width="24" height="460" rx="10" fill="#E2D5C8"/><rect x="318" y="-450" width="24" height="460" rx="10" fill="#E2D5C8"/>
    <circle cx="-120" cy="-190" r="40" fill="#D7C3A8"/><circle cx="-148" cy="-222" r="14" fill="#D7C3A8"/><circle cx="-92" cy="-222" r="14" fill="#D7C3A8"/>`
}

function sofa() {
  return `${sombra(480)}
    <rect x="-440" y="-300" width="880" height="210" rx="22" fill="#C8B6A8"/>
    <rect x="-480" y="-250" width="96" height="250" rx="22" fill="#BBA898"/>
    <rect x="384" y="-250" width="96" height="250" rx="22" fill="#BBA898"/>
    <rect x="-390" y="-150" width="780" height="130" rx="14" fill="#D3C2B4"/>
    <rect x="-360" y="-290" width="230" height="130" rx="16" fill="#DECFC2"/>
    <rect x="130" y="-290" width="230" height="130" rx="16" fill="#DECFC2"/>
    <rect x="-60" y="-250" width="130" height="96" rx="12" fill="#E1E8DC"/>
    <rect x="-440" y="-4" width="16" height="22" fill="#8A6A4F"/><rect x="424" y="-4" width="16" height="22" fill="#8A6A4F"/>
    <g transform="translate(-180 -620)">
      <rect width="120" height="160" rx="4" fill="#FFFCF9" stroke="#E8DCD3" stroke-width="3"/><rect x="14" y="14" width="92" height="92" fill="#E8CFC6"/>
      <rect x="150" y="30" width="120" height="160" rx="4" fill="#FFFCF9" stroke="#E8DCD3" stroke-width="3"/><rect x="164" y="44" width="92" height="92" fill="#DFE6EC"/>
      <rect x="300" y="0" width="120" height="160" rx="4" fill="#FFFCF9" stroke="#E8DCD3" stroke-width="3"/><rect x="314" y="14" width="92" height="92" fill="#E1E8DC"/>
    </g>`
}

function banheira() {
  return `${sombra(420)}
    <path d="M-400 -260 L 400 -260 L 370 -60 C 360 -20, 330 0, 290 0 L -290 0 C -330 0, -360 -20, -370 -60 Z" fill="#FAF4EE" stroke="#E2D5C8" stroke-width="4"/>
    <rect x="-420" y="-280" width="840" height="34" rx="16" fill="#F3EBE3" stroke="#E2D5C8" stroke-width="3"/>
    <path d="M300 -280 L 300 -360 C 300 -400, 360 -400, 360 -360" fill="none" stroke="#B9A79A" stroke-width="10" stroke-linecap="round"/>
    <rect x="-470" y="-420" width="40" height="420" rx="6" fill="#E2D5C8"/>
    <rect x="-520" y="-430" width="140" height="18" rx="6" fill="#D6C5B8"/>
    <rect x="-506" y="-412" width="112" height="190" rx="10" fill="#E8CFC6"/>
    <path d="M-560 -40 C -560 -110, -500 -120, -500 -40 Z" fill="#AEBDA5"/>
    <rect x="-570" y="-40" width="80" height="40" rx="6" fill="#E6D8CB"/>`
}

// ---------- Cena ----------

function cena({ padrao, moveis, teto = false }) {
  const forroAltura = teto ? 190 : 0
  const pendente = teto
    ? `<line x1="${CENTRO_MOVEIS}" y1="${forroAltura}" x2="${CENTRO_MOVEIS}" y2="${forroAltura + 170}" stroke="#9C877C" stroke-width="3"/>
       <path d="M${CENTRO_MOVEIS - 70} ${forroAltura + 240} C ${CENTRO_MOVEIS - 70} ${forroAltura + 170}, ${CENTRO_MOVEIS + 70} ${forroAltura + 170}, ${CENTRO_MOVEIS + 70} ${forroAltura + 240} Z" fill="#F1E6DA"/>`
    : ""
  let tabuas = ""
  for (let x = -60; x < MUNDO_W; x += 210) {
    tabuas += `<line x1="${x}" y1="${PISO + 24}" x2="${x + 80}" y2="${MUNDO_H}" stroke="#C9AE92" stroke-width="2" opacity=".55"/>`
  }
  return `
    <defs>
      <pattern id="p" width="${padrao.w}" height="${padrao.h}" patternUnits="userSpaceOnUse">${padrao.corpo}</pattern>
      ${padrao.filtro ? `<filter id="suave"><feGaussianBlur stdDeviation="1.4"/></filter>` : ""}
      <linearGradient id="luz" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stop-color="#FFF8EE" stop-opacity=".35"/><stop offset=".55" stop-color="#FFF8EE" stop-opacity="0"/><stop offset="1" stop-color="#6B5A52" stop-opacity=".08"/>
      </linearGradient>
    </defs>
    <rect width="${MUNDO_W}" height="${PISO}" fill="url(#p)" ${padrao.filtro ? 'filter="url(#suave)"' : ""}/>
    ${teto ? `<rect width="${MUNDO_W}" height="${forroAltura}" fill="url(#p)" opacity=".9"/><rect y="${forroAltura}" width="${MUNDO_W}" height="18" fill="#F4ECE6"/><rect y="${forroAltura + 18}" width="${MUNDO_W}" height="4" fill="#6B5A52" opacity=".06"/>` : ""}
    <rect width="${MUNDO_W}" height="${PISO}" fill="url(#luz)"/>
    <rect y="${PISO}" width="${MUNDO_W}" height="${MUNDO_H - PISO}" fill="#E3CFB8"/>
    ${tabuas}
    <rect y="${PISO - 6}" width="${MUNDO_W}" height="30" fill="#F4ECE6"/>
    <rect y="${PISO + 24}" width="${MUNDO_W}" height="5" fill="#6B5A52" opacity=".05"/>
    ${pendente}
    <g transform="translate(${CENTRO_MOVEIS} ${PISO + 10})">${moveis}</g>`
}

function svg(conteudo, viewBox, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice">${conteudo}</svg>`
}

const slides = [
  { padrao: aquarela(), moveis: aparador({ extra: pinceis }), yDesktop: 230 },
  { padrao: nuvens(), moveis: berco(), yDesktop: 230 },
  { padrao: listras(), moveis: sofa(), yDesktop: 220 },
  { padrao: ramos(), moveis: banheira(), teto: true, yDesktop: 0 },
  { padrao: linho(), moveis: aparador({ extra: rolos }), yDesktop: 230 },
]

for (const [i, s] of slides.entries()) {
  const conteudo = cena(s)
  const n = i + 1
  // 4:5 centrado nos móveis
  const mobile = svg(conteudo, `${CENTRO_MOVEIS - 540} 0 1080 1350`, 1080, 1350)
  // 16:7 com o mundo inteiro na largura
  const desktop = svg(conteudo, `0 ${s.yDesktop} 2400 1050`, 2400, 1050)
  await sharp(Buffer.from(mobile)).resize(864, 1080).webp({ quality: 74 }).toFile(join(destino, `slide-${n}-mobile.webp`))
  await sharp(Buffer.from(desktop)).resize(1920, 840).webp({ quality: 74 }).toFile(join(destino, `slide-${n}-desktop.webp`))
}

console.log("Placeholders do carrossel gerados em public/hero")
