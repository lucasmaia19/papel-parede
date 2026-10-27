import type { MedidaElemento } from "@/types"

export function textoMedida(m: MedidaElemento): string {
  const n = (v: number) => String(v).replace(".", ",")
  return m.alturaCm > 0
    ? `${m.rotulo}: ${n(m.larguraCm)} cm × ${n(m.alturaCm)} cm`
    : `${m.rotulo}: ${n(m.larguraCm)} cm de largura`
}

interface ReguaOverlayProps {
  largura: number
  altura: number
  /** px na tela por cm de papel */
  pxPorCm: number
  medidas: MedidaElemento[]
}

const FAIXA = 30

/**
 * Régua em cm desenhada por cima da foto (eixos horizontal e vertical),
 * mais o desenho do tamanho de cada elemento da estampa.
 */
export function ReguaOverlay({ largura, altura, pxPorCm, medidas }: ReguaOverlayProps) {
  if (largura <= 0 || altura <= 0 || pxPorCm <= 0) return null

  // Densidade das marcações conforme o espaço disponível
  const passoMarca = pxPorCm >= 4 ? 1 : 5
  const passoRotulo = pxPorCm * 10 >= 38 ? 10 : pxPorCm * 20 >= 38 ? 20 : 50

  const marcas = (comprimento: number) => {
    const total = Math.floor(comprimento / pxPorCm)
    const lista: { cm: number; pos: number; tam: number; rotulo: boolean }[] = []
    for (let cm = passoMarca; cm <= total; cm += passoMarca) {
      const pos = cm * pxPorCm
      if (pos < FAIXA + 2) continue
      const tam = cm % 10 === 0 ? 16 : cm % 5 === 0 ? 10 : 6
      // Rótulo colado na borda ficaria cortado
      lista.push({ cm, pos, tam, rotulo: cm % passoRotulo === 0 && pos < comprimento - 10 })
    }
    return lista
  }

  // Desenho das medidas no canto inferior esquerdo, lado a lado
  const desenhos: { m: MedidaElemento; x: number; w: number; h: number }[] = []
  let proximoX = FAIXA + 14
  for (const m of medidas) {
    const w = m.larguraCm * pxPorCm
    const h = m.alturaCm > 0 ? m.alturaCm * pxPorCm : 0
    if (w < 6 || w > largura - FAIXA - 28 || h > altura - FAIXA - 60) continue
    if (proximoX + Math.max(w, 64) > largura) break
    desenhos.push({ m, x: proximoX, w, h })
    proximoX += Math.max(w, 64) + 18
  }

  return (
    <svg
      data-slot="regua"
      className="pointer-events-none absolute inset-0 size-full"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={`Régua em centímetros. ${medidas.map(textoMedida).join(". ")}`}
    >
      {/* eixo horizontal */}
      <rect x={0} y={0} width={largura} height={FAIXA} fill="#fffdf9" opacity={0.92} />
      <line x1={0} y1={FAIXA} x2={largura} y2={FAIXA} stroke="#2b2b2b" strokeWidth={1} />
      {marcas(largura).map((m) => (
        <g key={`h${m.cm}`}>
          <line x1={m.pos} y1={0} x2={m.pos} y2={m.tam} stroke="#2b2b2b" strokeWidth={1} />
          {m.rotulo && (
            <text x={m.pos} y={FAIXA - 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#2b2b2b">
              {m.cm}
            </text>
          )}
        </g>
      ))}

      {/* eixo vertical */}
      <rect x={0} y={0} width={FAIXA} height={altura} fill="#fffdf9" opacity={0.92} />
      <line x1={FAIXA} y1={FAIXA} x2={FAIXA} y2={altura} stroke="#2b2b2b" strokeWidth={1} />
      {marcas(altura).map((m) => (
        <g key={`v${m.cm}`}>
          <line x1={0} y1={m.pos} x2={m.tam} y2={m.pos} stroke="#2b2b2b" strokeWidth={1} />
          {m.rotulo && (
            <text
              x={FAIXA - 5}
              y={m.pos}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#2b2b2b"
              transform={`rotate(-90 ${FAIXA - 5} ${m.pos})`}
              dy={-1}
            >
              {m.cm}
            </text>
          )}
        </g>
      ))}
      <rect x={0} y={0} width={FAIXA} height={FAIXA} fill="#fffdf9" />
      <text x={FAIXA / 2} y={FAIXA / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#2b2b2b">
        cm
      </text>

      {/* tamanho dos elementos */}
      {desenhos.map(({ m, x: dx, w, h }) => {
        const base = altura - 18
        const topo = base - h
        const rotulo = m.alturaCm > 0 ? `${m.larguraCm}×${m.alturaCm} cm` : `${m.larguraCm} cm`
        return (
          <g key={m.id}>
            {h > 0 ? (
              <>
                <rect x={dx} y={topo} width={w} height={h} fill="none" stroke="#fff" strokeWidth={5} />
                <rect x={dx} y={topo} width={w} height={h} fill="none" stroke="#2b2b2b" strokeWidth={2} strokeDasharray="5 3" />
              </>
            ) : (
              <>
                <line x1={dx} y1={base} x2={dx + w} y2={base} stroke="#fff" strokeWidth={7} />
                <line x1={dx} y1={base} x2={dx + w} y2={base} stroke="#2b2b2b" strokeWidth={3} />
                <line x1={dx} y1={base - 8} x2={dx} y2={base + 8} stroke="#2b2b2b" strokeWidth={2} />
                <line x1={dx + w} y1={base - 8} x2={dx + w} y2={base + 8} stroke="#2b2b2b" strokeWidth={2} />
              </>
            )}
            <rect x={dx - 2} y={topo - 30} width={Math.max(rotulo.length * 7.6 + 12, 40)} height={24} rx={3} fill="#2b2b2b" />
            <text x={dx + 4} y={topo - 13} fontSize={13} fontWeight={700} fill="#fff">
              {rotulo}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
