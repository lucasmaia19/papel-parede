"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"
import { ComparacaoSlider } from "@/components/comparacao-slider"
import { OpcaoBotao } from "@/components/opcao-botao"
import { WhatsappLink } from "@/components/whatsapp-link"
import { normalizar } from "@/lib/catalogo"
import { useLoja } from "@/lib/store"

export function GaleriaTrabalhos() {
  const trabalhos = useLoja((s) => s.trabalhos)
  const produtos = useLoja((s) => s.produtos)
  const [cidade, setCidade] = useState<string | null>(null)

  const cidades = [...new Map(trabalhos.map((t) => [normalizar(t.cidade), t.cidade])).values()].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  )
  // Destaques primeiro, mantendo a ordem definida no admin
  const ordenados = [...trabalhos.filter((t) => t.destaque), ...trabalhos.filter((t) => !t.destaque)]
  const lista = cidade ? ordenados.filter((t) => normalizar(t.cidade) === normalizar(cidade)) : ordenados

  return (
    <div className="flex flex-col gap-8">
      {cidades.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-medium">Filtrar por cidade</legend>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <OpcaoBotao ativo={cidade === null} onClick={() => setCidade(null)}>
              Todas
            </OpcaoBotao>
            {cidades.map((c) => (
              <OpcaoBotao key={c} ativo={cidade === c} onClick={() => setCidade(c)}>
                {c}
              </OpcaoBotao>
            ))}
          </div>
        </fieldset>
      )}

      <p aria-live="polite" className="font-medium">
        {lista.length} {lista.length === 1 ? "trabalho" : "trabalhos"}
        {cidade && ` em ${cidade}`}
      </p>

      <ul className="grid gap-12 md:grid-cols-2 md:gap-x-8">
        {lista.map((t) => {
          const produto = produtos.find((p) => p.id === t.produtoId && p.ativo)
          return (
            <li key={t.id} data-slot="trabalho" className="flex flex-col gap-3">
              <ComparacaoSlider
                antes={t.fotoAntes}
                depois={t.fotoDepois}
                altAntes={`Antes: ${t.titulo}`}
                altDepois={`Depois: ${t.titulo}`}
                proporcao="aspect-[16/11]"
              />
              <div className="flex flex-col gap-1">
                <h2 className="font-sans text-lg">{t.titulo}</h2>
                <p className="text-foreground-subtle">{t.cidade}</p>
              </div>
              {produto && (
                <Link
                  href={`/produtos/${produto.slug}`}
                  className="inline-flex min-h-12 items-center gap-2 self-start font-medium underline underline-offset-4 hover:text-primary"
                >
                  Ver o papel {produto.nome}
                  <ArrowRightIcon className="size-4" aria-hidden />
                </Link>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col items-start gap-3 border-t border-border pt-8">
        <p className="text-lg">Quer um resultado assim na sua casa?</p>
        <WhatsappLink mensagem="Olá! Vi os trabalhos realizados no site e gostaria de um orçamento.">
          Pedir orçamento no WhatsApp
        </WhatsappLink>
      </div>
    </div>
  )
}
