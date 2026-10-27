"use client"

import { useId, useRef, useState } from "react"
import { CameraIcon, ImageIcon, InfoIcon, LoaderCircleIcon, SparklesIcon, XIcon } from "lucide-react"
import { ComparacaoSlider } from "@/components/comparacao-slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { comprimirImagem, gerarPreviaDemonstracao, lerArquivo, paraPng } from "@/lib/imagem"
import { AVISO_SIMULACAO, LIMITE_SIMULACOES, type RespostaSimulacao } from "@/lib/simulacao"
import type { SimulacaoIA as SimulacaoEscolhida } from "@/types"

type Aba = "estampa" | "parede"

interface Resultado {
  tipo: Aba
  original: string
  simulada: string
  demonstracao: boolean
}

interface SimulacaoIAProps {
  produto: string
  cor: string
  personalizacoes: string
  /** Amostra do papel na cor escolhida */
  amostra: string
  sugestoes: string[]
  /** O que vai para o carrinho */
  valor: SimulacaoEscolhida | undefined
  onChange: (valor: SimulacaoEscolhida | undefined) => void
}

function Aviso() {
  return (
    <p data-slot="aviso-ia" className="flex gap-3 rounded-md border border-warning-border bg-warning-bg p-4 text-base">
      <InfoIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span>{AVISO_SIMULACAO}</span>
    </p>
  )
}

function MostrarResultado({ resultado }: { resultado: Resultado }) {
  const rotuloOriginal = resultado.tipo === "parede" ? "Sua foto" : "Original"
  return (
    <div data-slot="resultado-simulacao" className="flex flex-col gap-3">
      {/* Celular: uma imagem embaixo da outra. Computador: comparação arrastável */}
      <div className="grid gap-3 md:hidden">
        {[
          { rotulo: rotuloOriginal, src: resultado.original },
          { rotulo: "Simulação", src: resultado.simulada },
        ].map((f) => (
          <figure key={f.rotulo} className="flex flex-col gap-1.5">
            <figcaption className="font-medium">{f.rotulo}</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element -- base64 */}
            <img src={f.src} alt={f.rotulo} className="w-full rounded-md border border-border object-cover" />
          </figure>
        ))}
      </div>
      <ComparacaoSlider
        className="hidden md:flex"
        antes={resultado.original}
        depois={resultado.simulada}
        rotuloAntes={rotuloOriginal}
        rotuloDepois="Simulação"
        altAntes={rotuloOriginal}
        altDepois="Simulação feita com inteligência artificial"
        proporcao={resultado.tipo === "parede" ? "aspect-[4/3]" : "aspect-square"}
      />
      {resultado.demonstracao && (
        <p className="text-sm text-foreground-subtle">
          Modo demonstração: a loja ainda não ligou a inteligência artificial, então mostramos uma prévia simples.
        </p>
      )}
    </div>
  )
}

export function SimulacaoIA({ produto, cor, personalizacoes, amostra, sugestoes, valor, onChange }: SimulacaoIAProps) {
  const idObservacao = useId()
  const [aba, setAba] = useState<Aba>("estampa")
  const [observacao, setObservacao] = useState(valor?.observacao ?? "")
  const [foto, setFoto] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [restantes, setRestantes] = useState<number | null>(null)
  const camera = useRef<HTMLInputElement>(null)
  const galeria = useRef<HTMLInputElement>(null)

  function alterarObservacao(texto: string) {
    setObservacao(texto)
    // O texto vai junto com o pedido; a imagem antiga deixa de valer se o pedido mudou
    onChange(texto.trim() ? { tipo: "estampa", observacao: texto.trim() } : undefined)
  }

  async function escolherFoto(arquivo: File | undefined) {
    if (!arquivo) return
    setErro(null)
    if (!arquivo.type.startsWith("image/")) {
      setErro("Escolha uma foto (JPG ou PNG).")
      return
    }
    try {
      setFoto(await comprimirImagem(await lerArquivo(arquivo), { maxLado: 1024, qualidade: 0.82 }))
    } catch {
      setErro("Não conseguimos abrir essa foto. Tente outra.")
    }
  }

  async function simular(tipo: Aba) {
    if (tipo === "parede" && !foto) {
      setErro("Primeiro tire ou escolha uma foto da sua parede.")
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      const amostraPng = await paraPng(amostra, 768)
      const resposta = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          produto,
          cor,
          personalizacoes,
          observacao: observacao.trim(),
          amostra: amostraPng,
          foto: tipo === "parede" ? foto : undefined,
        }),
      })
      const dados = (await resposta.json()) as Partial<RespostaSimulacao> & { erro?: string }
      if (typeof dados.restantes === "number") setRestantes(dados.restantes)
      if (!resposta.ok || dados.erro) throw new Error(dados.erro ?? "Não conseguimos gerar a simulação.")

      const simulada =
        dados.imagem ??
        (await gerarPreviaDemonstracao({ tipo, amostra: amostraPng, foto: foto ?? undefined, observacao }))
      const original = tipo === "parede" && foto ? foto : amostraPng
      setResultado({ tipo, original, simulada, demonstracao: Boolean(dados.demonstracao) })
      // Vai para o carrinho em tamanho pequeno (o navegador tem pouco espaço)
      onChange({
        tipo,
        observacao: observacao.trim(),
        imagem: await comprimirImagem(simulada, { maxLado: 480, qualidade: 0.72 }),
      })
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não conseguimos gerar a simulação.")
    } finally {
      setCarregando(false)
    }
  }

  const botaoSimular = (tipo: Aba, rotulo: string) => (
    <Button size="lg" onClick={() => simular(tipo)} disabled={carregando || restantes === 0} className="w-full sm:w-auto">
      {carregando ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <SparklesIcon aria-hidden />}
      {carregando ? "Gerando…" : rotulo}
    </Button>
  )

  const resultadoDaAba = resultado?.tipo === aba ? resultado : null

  return (
    <div data-slot="simulacao-ia" className="flex flex-col gap-4">
      <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)}>
        <TabsList>
          <TabsTrigger value="estampa">Personalizar a estampa</TabsTrigger>
          <TabsTrigger value="parede">Veja na sua parede</TabsTrigger>
        </TabsList>

        <TabsContent value="estampa" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={idObservacao} className="font-medium">
              O que você gostaria de mudar? <span className="font-normal text-foreground-subtle">(opcional)</span>
            </label>
            <Textarea
              id={idObservacao}
              value={observacao}
              maxLength={400}
              placeholder="Exemplo: trocar a cor para verde-claro"
              onChange={(e) => alterarObservacao(e.target.value)}
            />
          </div>
          {sugestoes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-foreground-subtle">Ideias (toque para usar):</p>
              <ul className="flex flex-wrap gap-2">
                {sugestoes.map((s) => (
                  <li key={s}>
                    <Button variant="secondary" size="sm" onClick={() => alterarObservacao(s)} aria-pressed={observacao === s}>
                      {s}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Aviso />
          {botaoSimular("estampa", "Ver simulação")}
        </TabsContent>

        <TabsContent value="parede" className="flex flex-col gap-4">
          <p>Tire uma foto da parede de frente, com boa luz. A gente mostra como ela fica com o papel {produto} na cor {cor}.</p>
          <input
            ref={camera}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            data-slot="entrada-camera"
            onChange={(e) => {
              void escolherFoto(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <input
            ref={galeria}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            data-slot="entrada-galeria"
            onChange={(e) => {
              void escolherFoto(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <div className="grid gap-2 min-[400px]:grid-cols-2">
            <Button variant="outline" onClick={() => camera.current?.click()}>
              <CameraIcon aria-hidden />
              Tirar foto
            </Button>
            <Button variant="outline" onClick={() => galeria.current?.click()}>
              <ImageIcon aria-hidden />
              Escolher da galeria
            </Button>
          </div>
          {foto && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto local */}
              <img src={foto} alt="Foto da sua parede" className="max-h-80 w-full rounded-md border border-border object-cover" />
              <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setFoto(null)}>
                <XIcon aria-hidden />
                Trocar foto
              </Button>
            </div>
          )}
          <Aviso />
          {botaoSimular("parede", "Ver na minha parede")}
        </TabsContent>
      </Tabs>

      <div aria-live="polite" className="flex flex-col gap-3">
        {carregando && (
          <p className="flex items-center gap-2 font-medium">
            <LoaderCircleIcon className="size-5 animate-spin" aria-hidden />
            Gerando a simulação… isso pode levar alguns segundos.
          </p>
        )}
        {erro && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-medium text-destructive">
            {erro}
          </p>
        )}
        {restantes !== null && (
          <p className="text-sm text-foreground-subtle">
            {restantes > 0
              ? `Você ainda pode fazer ${restantes} ${restantes === 1 ? "simulação" : "simulações"} nesta visita (limite de ${LIMITE_SIMULACOES}).`
              : "Você usou todas as simulações desta visita."}
          </p>
        )}
      </div>

      {resultadoDaAba && !carregando && <MostrarResultado resultado={resultadoDaAba} />}

      {valor && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/40 bg-primary-soft/50 p-3">
          <p className="font-medium">
            {valor.imagem ? "A simulação e a observação vão junto com o pedido." : "Sua observação vai junto com o pedido."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setObservacao("")
              setResultado(null)
              onChange(undefined)
            }}
          >
            Não incluir
          </Button>
        </div>
      )}
    </div>
  )
}
