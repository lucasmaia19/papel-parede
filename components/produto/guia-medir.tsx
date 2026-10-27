"use client"

import { useState } from "react"
import { CircleHelpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WhatsappLink } from "@/components/whatsapp-link"
import { useLoja } from "@/lib/store"

const TRACO = "var(--desenho-cota)"

function Ilustracao({ passo }: { passo: 1 | 2 | 3 }) {
  return (
    <svg viewBox="0 0 280 160" className="w-full rounded-md border border-border bg-surface" aria-hidden>
      {/* parede, teto e chão */}
      <rect x={30} y={18} width={220} height={118} fill="var(--desenho-parede)" stroke="var(--desenho-traco)" strokeWidth={1.5} />
      <rect x={0} y={136} width={280} height={24} fill="var(--desenho-porta)" />
      {passo === 1 && (
        <>
          <line x1={30} y1={78} x2={250} y2={78} stroke={TRACO} strokeWidth={3} />
          <path d="M30 78 l12 -7 v14 Z M250 78 l-12 -7 v14 Z" fill={TRACO} />
          <rect x={92} y={60} width={96} height={30} rx={4} fill="var(--background)" stroke={TRACO} />
          <text x={140} y={81} textAnchor="middle" fontSize={15} fontWeight={500} fill="var(--desenho-traco)">
            Largura
          </text>
        </>
      )}
      {passo === 2 && (
        <>
          <line x1={140} y1={18} x2={140} y2={136} stroke={TRACO} strokeWidth={3} />
          <path d="M140 18 l-7 12 h14 Z M140 136 l-7 -12 h14 Z" fill={TRACO} />
          <rect x={150} y={62} width={72} height={30} rx={4} fill="var(--background)" stroke={TRACO} />
          <text x={186} y={83} textAnchor="middle" fontSize={15} fontWeight={500} fill="var(--desenho-traco)">
            Altura
          </text>
        </>
      )}
      {passo === 3 && (
        <>
          <rect x={56} y={58} width={44} height={78} fill="var(--desenho-porta)" stroke="var(--desenho-traco)" />
          <circle cx={92} cy={100} r={2.5} fill="var(--desenho-traco)" />
          <rect x={150} y={44} width={70} height={46} fill="var(--desenho-janela)" stroke="var(--desenho-traco)" />
          <line x1={185} y1={44} x2={185} y2={90} stroke="var(--desenho-traco)" />
          <text x={78} y={50} textAnchor="middle" fontSize={13} fontWeight={500} fill="var(--desenho-traco)">
            Porta
          </text>
          <text x={185} y={106} textAnchor="middle" fontSize={13} fontWeight={500} fill="var(--desenho-traco)">
            Janela
          </text>
          <line x1={56} y1={146} x2={100} y2={146} stroke={TRACO} strokeWidth={2.5} />
          <line x1={228} y1={44} x2={228} y2={90} stroke={TRACO} strokeWidth={2.5} />
        </>
      )}
    </svg>
  )
}

const PASSOS = [
  {
    titulo: "Meça a largura",
    texto: "Com a trena, meça a parede de uma ponta à outra, encostando no rodapé. Anote em metros. Exemplo: 3,20.",
  },
  {
    titulo: "Meça a altura",
    texto: "Meça do chão até o teto. Se a parede for mais alta de um lado, use a medida maior.",
  },
  {
    titulo: "Anote portas e janelas",
    texto: "Meça a largura e a altura de cada porta e janela da parede. A gente desconta essa área do papel.",
  },
] as const

export function GuiaMedir() {
  const [aberto, setAberto] = useState(false)
  const cidades = useLoja((s) => s.settings.cidadesAtendidas)
  const regiao = cidades[0]?.nome ?? "Uberlândia"

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)} className="w-full sm:w-auto">
        <CircleHelpIcon aria-hidden />
        Como medir sua parede?
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como medir sua parede</DialogTitle>
            <DialogDescription>São só 3 passos. Você vai precisar de uma trena.</DialogDescription>
          </DialogHeader>
          <ol className="flex flex-col gap-6">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="flex flex-col gap-2">
                <Ilustracao passo={(i + 1) as 1 | 2 | 3} />
                <h3 className="font-sans text-lg font-medium">
                  {i + 1}. {p.titulo}
                </h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3 rounded-md border border-border bg-muted p-4">
            <p className="font-medium">
              Ficou com dúvida? Em {regiao} e região fazemos a visita técnica para medir para você.
            </p>
            <WhatsappLink mensagem="Olá! Gostaria de agendar uma visita técnica para medir minha parede.">
              Agendar visita pelo WhatsApp
            </WhatsappLink>
          </div>
          <Button variant="outline" onClick={() => setAberto(false)}>
            Entendi, voltar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
