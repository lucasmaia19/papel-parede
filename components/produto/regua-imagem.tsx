"use client"

import { useEffect, useRef, useState } from "react"
import type { MedidaElemento, Regua } from "@/types"

const n = (v: number) => String(v).replace(".", ",")

/** "Cada quadrado mede 10 cm x 10 cm" / "Cada listra mede 5 cm de largura" */
export function textoMedida(m: MedidaElemento): string {
  return m.alturaCm > 0
    ? `${m.rotulo} mede ${n(m.larguraCm)} cm x ${n(m.alturaCm)} cm`
    : `${m.rotulo} mede ${n(m.larguraCm)} cm de largura`
}

/** Espessura das faixas em volta da foto: cota (rótulo da medida) + régua (marcações em cm) */
const COTA = 24
const REGUA = 30
const MARGEM = COTA + REGUA

interface Marca {
  cm: number
  pos: number
  tam: number
  rotulo: boolean
}

function marcas(comprimento: number, pxPorCm: number): Marca[] {
  const passo = pxPorCm >= 4 ? 1 : 5
  // Rótulos a cada 10 cm se couberem; senão a cada 20 ou 50
  const passoRotulo = pxPorCm * 10 >= 34 ? 10 : pxPorCm * 20 >= 34 ? 20 : 50
  const lista: Marca[] = []
  for (let cm = 0; cm * pxPorCm <= comprimento + 0.5; cm += passo) {
    const pos = cm * pxPorCm
    lista.push({
      cm,
      pos,
      tam: cm % 10 === 0 ? 14 : cm % 5 === 0 ? 9 : 5,
      // sem rótulo colado nas pontas, onde seria cortado
      rotulo: cm > 0 && cm % passoRotulo === 0 && pos < comprimento - 10,
    })
  }
  return lista
}

interface ReguaImagemProps {
  src: string
  alt: string
  regua: Regua
}

/**
 * Foto limpa (nada por cima) com réguas em cm nas margens externas:
 * horizontal acima e vertical à esquerda, na escala real (pixelsPorCm × escala da foto na tela).
 * A medida do elemento aparece como cota técnica nas réguas, alinhada ao início da estampa.
 */
export function ReguaImagem({ src, alt, regua }: ReguaImagemProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [tela, setTela] = useState({ w: 0, h: 0 })
  const [natural, setNatural] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const img = ref.current
    if (!img) return
    const obs = new ResizeObserver(([e]) => setTela({ w: e.contentRect.width, h: e.contentRect.height }))
    obs.observe(img)
    return () => obs.disconnect()
  }, [])

  function medir(img: HTMLImageElement | null) {
    if (img?.complete && img.naturalWidth > 0) {
      setNatural((atual) => (atual.w === img.naturalWidth ? atual : { w: img.naturalWidth, h: img.naturalHeight }))
    }
  }

  const pxPorCm = natural.w > 0 ? regua.pixelsPorCm * (tela.w / natural.w) : 0
  const pronto = pxPorCm > 0 && tela.w > 0 && tela.h > 0
  const principal = regua.medidas[0]
  const cotaW = principal ? principal.larguraCm * pxPorCm : 0
  const cotaH = principal && principal.alturaCm > 0 ? principal.alturaCm * pxPorCm : 0

  return (
    <figure data-slot="regua-imagem" className="flex flex-col gap-3">
      <div
        className="grid rounded-md border border-border bg-surface-raised p-2"
        style={{ gridTemplateColumns: `${MARGEM}px minmax(0, 1fr)`, gridTemplateRows: `${MARGEM}px auto` }}
      >
        {/* canto: unidade */}
        <div className="flex items-end justify-end pr-1.5 pb-1 text-xs text-foreground-subtle" aria-hidden>
          cm
        </div>

        {/* régua horizontal (acima da foto) */}
        <svg data-slot="regua-horizontal" width="100%" height={MARGEM} aria-hidden className="block overflow-visible">
          {pronto && (
            <>
              {cotaW > 0 && (
                <g data-slot="cota-horizontal">
                  <rect x={0} y={COTA} width={cotaW} height={REGUA} fill="var(--primary-soft)" />
                  <line x1={0} y1={COTA / 2 + 4} x2={cotaW} y2={COTA / 2 + 4} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <line x1={0.5} y1={4} x2={0.5} y2={COTA} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <line x1={cotaW} y1={4} x2={cotaW} y2={COTA} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <text
                    x={cotaW >= 46 ? cotaW / 2 : cotaW + 4}
                    y={COTA / 2}
                    textAnchor={cotaW >= 46 ? "middle" : "start"}
                    fontSize={14}
                    fontWeight={500}
                    fill="var(--desenho-traco)"
                    paintOrder="stroke"
                    stroke="var(--surface-raised)"
                    strokeWidth={4}
                  >
                    {n(principal!.larguraCm)} cm
                  </text>
                </g>
              )}
              <line x1={0} y1={MARGEM - 0.5} x2={tela.w} y2={MARGEM - 0.5} stroke="var(--desenho-traco)" strokeWidth={1} />
              {marcas(tela.w, pxPorCm).map((m) => (
                <g key={m.cm}>
                  <line x1={m.pos} y1={MARGEM} x2={m.pos} y2={MARGEM - m.tam} stroke="var(--desenho-traco)" strokeWidth={1} />
                  {m.rotulo && (
                    <text x={m.pos} y={MARGEM - 17} textAnchor="middle" fontSize={13} fill="var(--desenho-traco)">
                      {m.cm}
                    </text>
                  )}
                </g>
              ))}
            </>
          )}
        </svg>

        {/* régua vertical (à esquerda da foto) */}
        <svg data-slot="regua-vertical" width={MARGEM} height={tela.h || 1} aria-hidden className="block overflow-visible">
          {pronto && (
            <>
              {cotaH > 0 && (
                <g data-slot="cota-vertical">
                  <rect x={COTA} y={0} width={REGUA} height={cotaH} fill="var(--primary-soft)" />
                  <line x1={COTA / 2 + 4} y1={0} x2={COTA / 2 + 4} y2={cotaH} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <line x1={4} y1={0.5} x2={COTA} y2={0.5} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <line x1={4} y1={cotaH} x2={COTA} y2={cotaH} stroke="var(--desenho-cota)" strokeWidth={1} />
                  <text
                    x={COTA / 2}
                    y={cotaH >= 46 ? cotaH / 2 : cotaH + 24}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={500}
                    fill="var(--desenho-traco)"
                    paintOrder="stroke"
                    stroke="var(--surface-raised)"
                    strokeWidth={4}
                    transform={`rotate(-90 ${COTA / 2} ${cotaH >= 46 ? cotaH / 2 : cotaH + 24})`}
                  >
                    {n(principal!.alturaCm)} cm
                  </text>
                </g>
              )}
              <line x1={MARGEM - 0.5} y1={0} x2={MARGEM - 0.5} y2={tela.h} stroke="var(--desenho-traco)" strokeWidth={1} />
              {marcas(tela.h, pxPorCm).map((m) => (
                <g key={m.cm}>
                  <line x1={MARGEM} y1={m.pos} x2={MARGEM - m.tam} y2={m.pos} stroke="var(--desenho-traco)" strokeWidth={1} />
                  {m.rotulo && (
                    <text
                      x={MARGEM - 17}
                      y={m.pos}
                      textAnchor="middle"
                      fontSize={13}
                      fill="var(--desenho-traco)"
                      transform={`rotate(-90 ${MARGEM - 17} ${m.pos})`}
                    >
                      {m.cm}
                    </text>
                  )}
                </g>
              ))}
            </>
          )}
        </svg>

        {/* foto 100% limpa, sem corte: a escala na tela é exata */}
        {/* eslint-disable-next-line @next/next/no-img-element -- pode ser base64 do admin */}
        <img
          ref={(el) => {
            ref.current = el
            medir(el)
          }}
          src={src}
          alt={alt}
          onLoad={(e) => medir(e.currentTarget)}
          draggable={false}
          data-slot="foto-regua"
          className="block h-auto w-full select-none"
        />
      </div>

      <figcaption className="flex flex-col gap-0.5" aria-live="polite">
        {regua.medidas.length > 0 ? (
          regua.medidas.map((m) => <span key={m.id}>{textoMedida(m)}</span>)
        ) : (
          <span className="text-foreground-subtle">Use as marcações em centímetros para ter ideia do tamanho real.</span>
        )}
      </figcaption>
    </figure>
  )
}
