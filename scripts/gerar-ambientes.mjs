// Gera as ilustrações dos ambientes (public/img/ambientes/*.svg): traço fino taupe, tons pastel,
// sem preto nem branco puro. Rodar: node scripts/gerar-ambientes.mjs
import { mkdirSync, writeFileSync } from "node:fs"

const C = {
  parede: "#F4ECE6",
  piso: "#EADFD6",
  traco: "#7A6359",
  creme: "#FFFCF9",
  rose: "#EAD3C9",
  roseForte: "#C9A396",
  salvia: "#E1E8DC",
  salviaForte: "#B9C7B3",
  azul: "#DFE6EC",
  azulForte: "#B8C6D3",
  areia: "#E8DCD3",
}

const t = `stroke="${C.traco}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`

/** Parede com bolinhas de papel de parede, piso e rodapé */
function cena(conteudo, { padrao = C.roseForte, piso = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" role="img">
  <defs>
    <pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.3" fill="${padrao}" opacity=".55"/>
      <circle cx="12" cy="12" r="1.3" fill="${padrao}" opacity=".55"/>
    </pattern>
  </defs>
  <rect width="240" height="180" fill="${C.parede}"/>
  <rect width="240" height="${piso ? 142 : 180}" fill="url(#p)"/>
  ${piso ? `<rect y="142" width="240" height="38" fill="${C.piso}"/><path d="M0 142h240" ${t}/>` : ""}
  ${conteudo}
</svg>
`
}

const quadro = (x, y, w, h, fill = C.azul) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${C.creme}" ${t}/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="${fill}" stroke="none"/>`

const planta = (x, y) => `
  <path d="M${x} ${y - 12}c-8-4-12-14-10-24 7 4 11 13 10 24Z" fill="${C.salviaForte}" ${t}/>
  <path d="M${x} ${y - 12}c6-6 14-8 20-5-4 7-12 9-20 5Z" fill="${C.salvia}" ${t}/>
  <path d="M${x - 9} ${y - 12}h18l-3 16h-12Z" fill="${C.roseForte}" ${t}/>`

const ilustracoes = {
  quarto: cena(`
  ${quadro(98, 28, 44, 30, C.rose)}
  <path d="M58 132V84a14 14 0 0 1 14-14h96a14 14 0 0 1 14 14v48" fill="${C.rose}" ${t}/>
  <rect x="46" y="108" width="148" height="28" rx="6" fill="${C.creme}" ${t}/>
  <rect x="68" y="96" width="44" height="18" rx="8" fill="${C.creme}" ${t}/>
  <rect x="128" y="96" width="44" height="18" rx="8" fill="${C.creme}" ${t}/>
  <path d="M46 118h148v12a6 6 0 0 1-6 6H52a6 6 0 0 1-6-6Z" fill="${C.azul}" ${t}/>
  <path d="M54 136v10M186 136v10" ${t}/>
  <rect x="196" y="112" width="24" height="30" rx="2" fill="${C.areia}" ${t}/>
  <path d="M208 112V98M200 98h16l-3-12h-10Z" fill="${C.creme}" ${t}/>`),

  "sala-de-estar": cena(`
  ${quadro(70, 26, 36, 46, C.salvia)}${quadro(114, 34, 50, 32)}
  <rect x="44" y="86" width="152" height="34" rx="10" fill="${C.salvia}" ${t}/>
  <rect x="34" y="104" width="22" height="36" rx="8" fill="${C.salviaForte}" ${t}/>
  <rect x="184" y="104" width="22" height="36" rx="8" fill="${C.salviaForte}" ${t}/>
  <rect x="54" y="116" width="132" height="22" rx="5" fill="${C.salvia}" ${t}/>
  <path d="M120 116v22" ${t}/>
  <rect x="64" y="94" width="26" height="22" rx="5" fill="${C.rose}" ${t}/>
  <path d="M44 140v6M196 140v6" ${t}/>
  <path d="M218 142V62M206 62h24l-5-18h-14Z" fill="${C.creme}" ${t}/>`, { padrao: C.salviaForte }),

  "sala-de-jantar": cena(`
  <path d="M120 0v34" ${t}/>
  <path d="M100 48a20 14 0 0 1 40 0Z" fill="${C.roseForte}" ${t}/>
  ${quadro(30, 30, 36, 28, C.salvia)}${quadro(174, 30, 36, 28, C.azul)}
  <rect x="34" y="70" width="30" height="40" rx="8" fill="${C.rose}" ${t}/>
  <rect x="30" y="108" width="40" height="8" rx="2" fill="${C.roseForte}" ${t}/>
  <path d="M36 116v26M64 116v26" ${t}/>
  <rect x="176" y="70" width="30" height="40" rx="8" fill="${C.rose}" ${t}/>
  <rect x="170" y="108" width="40" height="8" rx="2" fill="${C.roseForte}" ${t}/>
  <path d="M176 116v26M204 116v26" ${t}/>
  <rect x="72" y="96" width="96" height="8" rx="2" fill="${C.areia}" ${t}/>
  <path d="M82 104v38M158 104v38" ${t}/>
  <path d="M114 96c-2-6-2-10 1-14h10c3 4 3 8 1 14Z" fill="${C.azul}" ${t}/>
  <circle cx="114" cy="74" r="5" fill="${C.rose}" ${t}/><circle cx="126" cy="72" r="5" fill="${C.creme}" ${t}/><circle cx="120" cy="66" r="5" fill="${C.roseForte}" ${t}/>
  <path d="M118 82l-3-4M122 82l3-6M120 82V71" fill="none" ${t}/>`),

  cozinha: cena(`
  <rect x="28" y="22" width="184" height="40" rx="2" fill="${C.azul}" ${t}/>
  <path d="M74 22v40M120 22v40M166 22v40M66 46v8M82 46v8M158 46v8M174 46v8" ${t}/>
  <g fill="none" stroke="${C.azulForte}" stroke-width="1">
    <path d="M28 74h184M28 86h184M28 98h184M44 62v42M64 62v42M84 62v42M104 62v42M124 62v42M144 62v42M164 62v42M184 62v42M204 62v42"/>
  </g>
  <rect x="24" y="104" width="192" height="8" rx="2" fill="${C.areia}" ${t}/>
  <rect x="28" y="112" width="184" height="30" fill="${C.creme}" ${t}/>
  <path d="M74 112v30M120 112v30M166 112v30M70 124v8M78 124v8M162 124v8M170 124v8" ${t}/>
  <path d="M60 104V90a6 6 0 0 1 12 0" fill="none" ${t}/>
  <path d="M136 104v-12h30v12" fill="${C.roseForte}" ${t}/><path d="M132 92h38" ${t}/>`, { padrao: C.azulForte }),

  banheiro: cena(`
  <ellipse cx="120" cy="56" rx="30" ry="38" fill="${C.azul}" ${t}/>
  <path d="M104 40c4-6 10-9 16-9" fill="none" stroke="${C.creme}" stroke-width="3" stroke-linecap="round"/>
  <rect x="72" y="104" width="96" height="10" rx="3" fill="${C.creme}" ${t}/>
  <rect x="80" y="114" width="80" height="28" fill="${C.salvia}" ${t}/>
  <path d="M120 114v28M112 124v8M128 124v8" ${t}/>
  <path d="M120 104v-10h10" fill="none" ${t}/>
  <path d="M190 60h24M196 60v42h12V60" fill="${C.rose}" ${t}/>
  <path d="M196 92h12" ${t}/>
  <path d="M40 74c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10ZM52 96c-2 3-4 5-4 7a4 4 0 0 0 8 0c0-2-2-4-4-7Z" fill="${C.azul}" ${t}/>`, { padrao: C.azulForte }),

  teto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" role="img">
  <defs>
    <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse">
      <path d="M0 7h14" stroke="${C.roseForte}" stroke-width="1" opacity=".5"/>
      <circle cx="7" cy="3" r="1.2" fill="${C.roseForte}" opacity=".6"/>
    </pattern>
  </defs>
  <rect width="240" height="180" fill="${C.parede}"/>
  <path d="M0 0h240L184 52H56Z" fill="${C.rose}"/>
  <path d="M0 0h240L184 52H56Z" fill="url(#p)" ${t}/>
  <path d="M56 52v128M184 52v128" ${t}/>
  <path d="M0 0l56 52M240 0l-56 52" ${t}/>
  <path d="M56 154h128" ${t}/>
  <path d="M56 154 0 180M184 154l56 26" ${t}/>
  <rect x="56" y="154" width="128" height="26" fill="${C.piso}" stroke="none"/>
  <path d="M120 26v42" ${t}/>
  <path d="M100 86a20 18 0 0 1 40 0Z" fill="${C.creme}" ${t}/>
  <path d="M114 92a6 6 0 0 0 12 0" fill="${C.areia}" ${t}/>
  <path d="M104 100l-4 8M120 102v9M136 100l4 8" stroke="${C.roseForte}" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`,

  escritorio: cena(`
  <rect x="150" y="30" width="64" height="8" rx="1" fill="${C.areia}" ${t}/>
  <rect x="156" y="12" width="7" height="18" fill="${C.rose}" ${t}/><rect x="164" y="14" width="7" height="16" fill="${C.azul}" ${t}/>
  <rect x="172" y="10" width="7" height="20" fill="${C.salvia}" ${t}/><path d="M184 30l6-17 6 2-6 15" fill="${C.roseForte}" ${t}/>
  ${quadro(44, 26, 40, 30, C.salvia)}
  <rect x="30" y="96" width="140" height="8" rx="2" fill="${C.areia}" ${t}/>
  <path d="M38 104v38M162 104v38" ${t}/>
  <rect x="64" y="66" width="52" height="30" rx="3" fill="${C.azul}" ${t}/>
  <path d="M56 96h68" ${t}/>
  <path d="M140 96c0-10 2-14 6-14h4c4 0 6 4 6 14" fill="${C.creme}" ${t}/>
  <path d="M184 142v-30a8 8 0 0 1 8-8h8M190 122h30M200 104v38" fill="none" ${t}/>
  <rect x="192" y="76" width="26" height="30" rx="8" fill="${C.rose}" ${t}/>
  ${planta(222, 142)}`, { padrao: C.salviaForte }),

  corredor: cena(`
  <path d="M30 142V58a28 28 0 0 1 56 0v84" fill="${C.salvia}" ${t}/>
  <path d="M40 142V62a18 18 0 0 1 36 0v80" fill="none" ${t}/>
  <circle cx="70" cy="104" r="2.5" fill="${C.traco}"/>
  <circle cx="160" cy="54" r="22" fill="${C.azul}" ${t}/>
  <rect x="124" y="92" width="72" height="8" rx="2" fill="${C.areia}" ${t}/>
  <path d="M130 100v42M190 100v42M130 124h60" ${t}/>
  <path d="M146 92v-8c0-4 4-6 8-6M168 92c0-12 10-12 10 0" fill="none" ${t}/>
  <path d="M96 180l12-30h44l12 30Z" fill="${C.rose}" ${t}/>
  <path d="M112 160h36M106 170h48" stroke="${C.roseForte}" stroke-width="1.2" stroke-linecap="round"/>`),

  brinquedoteca: cena(`
  <path d="M8 20q56 26 112 0t112 0" fill="none" ${t}/>
  ${[20, 44, 68, 92, 116, 140, 164, 188, 212]
    .map((x, i) => {
      const y = 20 + Math.round(13 * Math.sin(((x - 8) / 112) * Math.PI))
      const cor = [C.rose, C.azul, C.salvia][i % 3]
      return `<path d="M${x - 7} ${y}h14l-7 14Z" fill="${cor}" ${t}/>`
    })
    .join("")}
  <path d="M40 142l34-72 34 72Z" fill="${C.azul}" ${t}/>
  <path d="M74 70v-8M74 142l-12-34M74 142l12-34" fill="none" ${t}/>
  <rect x="128" y="118" width="24" height="24" rx="2" fill="${C.rose}" ${t}/>
  <rect x="154" y="118" width="24" height="24" rx="2" fill="${C.salvia}" ${t}/>
  <rect x="141" y="94" width="24" height="24" rx="2" fill="${C.azul}" ${t}/>
  <path d="M136 124l4 12 4-12M160 124h12M166 124v12M147 100h12v12h-12" fill="none" stroke="${C.traco}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="204" cy="124" r="16" fill="${C.areia}" ${t}/>
  <circle cx="204" cy="98" r="11" fill="${C.areia}" ${t}/>
  <circle cx="195" cy="88" r="4" fill="${C.rose}" ${t}/><circle cx="213" cy="88" r="4" fill="${C.rose}" ${t}/>
  <circle cx="200" cy="97" r="1.3" fill="${C.traco}"/><circle cx="208" cy="97" r="1.3" fill="${C.traco}"/>
  <path d="M201 103q3 2 6 0" fill="none" ${t}/>`, { padrao: C.azulForte }),

  comercial: cena(`
  <rect x="36" y="28" width="168" height="114" fill="${C.creme}" ${t}/>
  <path d="M28 44h184l-8 22H36Z" fill="${C.rose}" ${t}/>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const x = 36 + i * 21
      return `<path d="M${x} 66a10.5 8 0 0 0 21 0" fill="${i % 2 ? C.roseForte : C.creme}" ${t}/>`
    })
    .join("")}
  <rect x="88" y="22" width="64" height="16" rx="2" fill="${C.salvia}" ${t}/>
  <path d="M100 30h40" stroke="${C.traco}" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="4 3"/>
  <rect x="48" y="88" width="70" height="54" fill="${C.azul}" ${t}/>
  <path d="M83 88v54M48 114h70" ${t}/>
  <rect x="136" y="88" width="50" height="54" fill="${C.salvia}" ${t}/>
  <circle cx="178" cy="116" r="2.5" fill="${C.traco}"/>
  ${planta(20, 142)}${planta(222, 142)}`),
}

mkdirSync("public/img/ambientes", { recursive: true })
for (const [nome, svg] of Object.entries(ilustracoes)) {
  writeFileSync(`public/img/ambientes/${nome}.svg`, svg)
}
console.log(`${Object.keys(ilustracoes).length} ilustrações em public/img/ambientes`)
