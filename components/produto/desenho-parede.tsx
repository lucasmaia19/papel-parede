import { formatarNumero } from "@/lib/pricing"
import type { Parede } from "@/types"

const VW = 320
const VH = 210
const MARGEM = { esq: 40, dir: 12, topo: 12, base: 34 }

/**
 * Desenho da parede em proporção real, que muda conforme o cliente digita.
 * Portas ficam encostadas no chão; janelas no meio da parede.
 */
export function DesenhoParede({ parede, rotulo }: { parede: Parede; rotulo: string }) {
  const { largura, altura } = parede
  const areaW = VW - MARGEM.esq - MARGEM.dir
  const areaH = VH - MARGEM.topo - MARGEM.base

  if (largura <= 0 || altura <= 0) {
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" role="img" aria-label={`${rotulo}: digite a largura e a altura para ver o desenho`}>
        <rect x={MARGEM.esq} y={MARGEM.topo} width={areaW} height={areaH} fill="none" stroke="#8c8376" strokeDasharray="6 5" strokeWidth={1.5} rx={2} />
        <text x={MARGEM.esq + areaW / 2} y={MARGEM.topo + areaH / 2 + 6} textAnchor="middle" fontSize={16} fill="#57524a">
          Digite as medidas
        </text>
      </svg>
    )
  }

  const escala = Math.min(areaW / largura, areaH / altura)
  const w = largura * escala
  const h = altura * escala
  const x0 = MARGEM.esq + (areaW - w) / 2
  const y0 = MARGEM.topo + (areaH - h)

  // Distribui as aberturas ao longo da parede
  const n = parede.aberturas.length
  const aberturas = parede.aberturas.map((a, i) => {
    const aw = Math.min(a.largura, largura) * escala
    const ah = Math.min(a.altura, altura) * escala
    const centro = x0 + (w * (i + 1)) / (n + 1)
    const ax = Math.max(x0, Math.min(centro - aw / 2, x0 + w - aw))
    const ay = a.tipo === "porta" ? y0 + h - ah : y0 + Math.max(0, (h - ah) * 0.4)
    return { ...a, ax, ay, aw, ah }
  })

  const descricao = `${rotulo}: ${formatarNumero(largura)} metros de largura por ${formatarNumero(altura)} metros de altura${
    n ? `, com ${n} ${n === 1 ? "porta ou janela" : "portas ou janelas"}` : ""
  }`

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" role="img" aria-label={descricao}>
      <rect x={x0} y={y0} width={w} height={h} fill="#ede6db" stroke="#2b2b2b" strokeWidth={1.5} />
      {aberturas.map((a) => (
        <g key={a.id}>
          <rect
            x={a.ax}
            y={a.ay}
            width={a.aw}
            height={a.ah}
            fill={a.tipo === "porta" ? "#c9b291" : "#dfe8ee"}
            stroke="#2b2b2b"
            strokeWidth={1}
          />
          {a.tipo === "janela" && a.aw > 8 && (
            <line x1={a.ax + a.aw / 2} y1={a.ay} x2={a.ax + a.aw / 2} y2={a.ay + a.ah} stroke="#2b2b2b" strokeWidth={0.8} />
          )}
          {a.tipo === "porta" && a.aw > 8 && <circle cx={a.ax + a.aw * 0.8} cy={a.ay + a.ah * 0.55} r={1.8} fill="#2b2b2b" />}
        </g>
      ))}
      {/* cota da largura */}
      <line x1={x0} y1={y0 + h + 14} x2={x0 + w} y2={y0 + h + 14} stroke="#43584a" strokeWidth={1.5} />
      <line x1={x0} y1={y0 + h + 8} x2={x0} y2={y0 + h + 20} stroke="#43584a" strokeWidth={1.5} />
      <line x1={x0 + w} y1={y0 + h + 8} x2={x0 + w} y2={y0 + h + 20} stroke="#43584a" strokeWidth={1.5} />
      <text x={x0 + w / 2} y={y0 + h + 31} textAnchor="middle" fontSize={15} fontWeight={700} fill="#2b2b2b">
        {formatarNumero(largura)} m
      </text>
      {/* cota da altura */}
      <line x1={x0 - 14} y1={y0} x2={x0 - 14} y2={y0 + h} stroke="#43584a" strokeWidth={1.5} />
      <line x1={x0 - 20} y1={y0} x2={x0 - 8} y2={y0} stroke="#43584a" strokeWidth={1.5} />
      <line x1={x0 - 20} y1={y0 + h} x2={x0 - 8} y2={y0 + h} stroke="#43584a" strokeWidth={1.5} />
      <text
        x={x0 - 22}
        y={y0 + h / 2}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fill="#2b2b2b"
        transform={`rotate(-90 ${x0 - 22} ${y0 + h / 2})`}
      >
        {formatarNumero(altura)} m
      </text>
    </svg>
  )
}
