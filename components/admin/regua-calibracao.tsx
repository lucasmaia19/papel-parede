"use client"

import { useState } from "react"
import { CrosshairIcon, RotateCcwIcon } from "lucide-react"
import { CampoTexto } from "@/components/admin/campos"
import { Button } from "@/components/ui/button"
import { calcularPixelsPorCm } from "@/lib/admin-produto"
import { formatarNumero, parseDecimal } from "@/lib/pricing"

interface Ponto {
  x: number
  y: number
}

interface ReguaCalibracaoProps {
  imagem: string | undefined
  /** px por cm atual (texto do formulário) */
  pixelsPorCm: string
  onCalibrar: (pixelsPorCm: string) => void
}

/**
 * Calibração por clique: a pessoa toca em dois pontos da foto (ex.: as bordas de um quadrado)
 * e informa quantos cm há entre eles. Os pontos são guardados em pixels da imagem original.
 */
export function ReguaCalibracao({ imagem, pixelsPorCm, onCalibrar }: ReguaCalibracaoProps) {
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const [distancia, setDistancia] = useState("")
  const [erro, setErro] = useState<string | null>(null)

  if (!imagem) {
    return <p className="rounded-md border border-border bg-muted p-4">Envie uma foto primeiro. A régua usa a foto principal.</p>
  }

  function clicar(e: React.MouseEvent<HTMLButtonElement>) {
    if (!natural.w) return
    const caixa = e.currentTarget.getBoundingClientRect()
    const ponto = {
      x: ((e.clientX - caixa.left) / caixa.width) * natural.w,
      y: ((e.clientY - caixa.top) / caixa.height) * natural.h,
    }
    setPontos((atual) => (atual.length >= 2 ? [ponto] : [...atual, ponto]))
    setErro(null)
  }

  function calcular() {
    const cm = parseDecimal(distancia)
    if (pontos.length < 2) return setErro("Toque em dois pontos da foto.")
    if (cm === null || cm <= 0) return setErro("Digite quantos centímetros há entre os dois pontos.")
    const resultado = calcularPixelsPorCm(pontos[0], pontos[1], cm)
    if (!resultado) return setErro("Os pontos estão muito próximos. Toque em pontos mais distantes.")
    onCalibrar(String(Math.round(resultado * 1000) / 1000).replace(".", ","))
  }

  const raio = Math.max(6, natural.w / 90)
  const pxAtual = parseDecimal(pixelsPorCm)

  return (
    <div data-slot="regua-calibracao" className="flex flex-col gap-4">
      <ol className="flex list-decimal flex-col gap-1 pl-6">
        <li>Toque em um ponto da foto (por exemplo, a borda de um quadrado).</li>
        <li>Toque no segundo ponto (a outra borda).</li>
        <li>Digite a distância real entre eles, em centímetros, e toque em “Calcular”.</li>
      </ol>

      <button
        type="button"
        onClick={clicar}
        aria-label="Foto para marcar os dois pontos da régua"
        data-slot="foto-calibracao"
        className="relative block w-full cursor-crosshair overflow-hidden rounded-md border-2 border-input outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- precisa do tamanho natural */}
        <img
          src={imagem}
          alt=""
          className="block h-auto w-full"
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          ref={(el) => {
            if (el?.complete && el.naturalWidth && natural.w !== el.naturalWidth) {
              setNatural({ w: el.naturalWidth, h: el.naturalHeight })
            }
          }}
          draggable={false}
        />
        {natural.w > 0 && (
          <svg className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${natural.w} ${natural.h}`} aria-hidden>
            {pontos.length === 2 && (
              <>
                <line x1={pontos[0].x} y1={pontos[0].y} x2={pontos[1].x} y2={pontos[1].y} stroke="var(--background)" strokeWidth={raio} />
                <line x1={pontos[0].x} y1={pontos[0].y} x2={pontos[1].x} y2={pontos[1].y} stroke="var(--primary)" strokeWidth={raio / 2.5} />
              </>
            )}
            {pontos.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={raio * 1.6} fill="var(--background)" />
                <circle cx={p.x} cy={p.y} r={raio} fill="var(--primary)" />
              </g>
            ))}
          </svg>
        )}
      </button>

      <p aria-live="polite" className="font-medium">
        {pontos.length === 0 && "Nenhum ponto marcado."}
        {pontos.length === 1 && "1 ponto marcado. Toque no segundo ponto."}
        {pontos.length === 2 &&
          `2 pontos marcados (${formatarNumero(Math.round(Math.hypot(pontos[1].x - pontos[0].x, pontos[1].y - pontos[0].y)))} px de distância).`}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <CampoTexto
          rotulo="Distância entre os pontos"
          valor={distancia}
          onChange={setDistancia}
          inputMode="decimal"
          sufixo="cm"
          placeholder="Ex.: 10"
          className="sm:w-56"
        />
        <Button onClick={calcular}>
          <CrosshairIcon aria-hidden />
          Calcular
        </Button>
        <Button variant="outline" onClick={() => setPontos([])} disabled={pontos.length === 0}>
          <RotateCcwIcon aria-hidden />
          Limpar pontos
        </Button>
      </div>
      {erro && (
        <p role="alert" className="font-medium text-destructive">
          {erro}
        </p>
      )}
      {pxAtual && pxAtual > 0 ? (
        <p role="status" className="rounded-md border border-primary/40 bg-primary-soft/60 p-3 font-medium">
          Régua calibrada: {pixelsPorCm} pixels por cm.
        </p>
      ) : (
        <p className="text-foreground-subtle">A régua ainda não foi calibrada.</p>
      )}
    </div>
  )
}
