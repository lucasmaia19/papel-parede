"use client"

import { useState } from "react"
import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { CabecalhoAdmin } from "@/components/admin/admin-shell"
import { CampoTexto, ErroCampo, Interruptor, SecaoAdmin } from "@/components/admin/campos"
import { Button } from "@/components/ui/button"
import { novaCidade, settingsParaForm, validarSettings, type ErrosSettings, type SettingsForm } from "@/lib/admin-settings"
import { formatarWhatsapp } from "@/lib/contato"
import { useHidratado, useLoja } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Settings } from "@/types"

export function ConfiguracoesAdmin() {
  const hidratado = useHidratado()
  const settings = useLoja((s) => s.settings)
  if (!hidratado) return <div className="container-loja min-h-[50vh] py-8" aria-busy="true" />
  return <Formulario inicial={settings} />
}

function Formulario({ inicial }: { inicial: Settings }) {
  const salvarSettings = useLoja((s) => s.salvarSettings)
  const [f, setF] = useState<SettingsForm>(() => settingsParaForm(inicial))
  const [erros, setErros] = useState<ErrosSettings>({})
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [alterado, setAlterado] = useState(false)

  function alterar(dados: Partial<SettingsForm>) {
    setF((atual) => ({ ...atual, ...dados }))
    setAlterado(true)
    setMensagem(null)
  }

  function alterarCidade(i: number, dados: Partial<SettingsForm["cidadesAtendidas"][number]>) {
    alterar({ cidadesAtendidas: f.cidadesAtendidas.map((c, j) => (j === i ? { ...c, ...dados } : c)) })
  }

  function salvar() {
    const { settings, erros: novos } = validarSettings(f)
    setErros(novos)
    if (!settings) {
      requestAnimationFrame(() => document.querySelector("[data-slot=resumo-erros]")?.scrollIntoView({ behavior: "smooth", block: "center" }))
      return
    }
    salvarSettings(settings)
    setAlterado(false)
    setMensagem("Configurações salvas. Já valem na loja.")
  }

  const qtdErros = Object.keys(erros).length

  return (
    <div className="flex flex-col">
      <div className="container-loja flex flex-col gap-6 py-8">
        <CabecalhoAdmin titulo="Configurações" descricao="Valores usados nos cálculos da loja. Tudo muda na hora, ao salvar." />

        {qtdErros > 0 && (
          <p data-slot="resumo-erros" role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 font-bold text-destructive">
            {qtdErros === 1 ? "Falta corrigir 1 campo." : `Falta corrigir ${qtdErros} campos.`} As mensagens estão em vermelho abaixo.
          </p>
        )}

        <SecaoAdmin titulo="Preços e serviços">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto rotulo="Preço padrão por m² (novos papéis)" sufixo="R$/m²" inputMode="decimal" valor={f.precoM2Padrao} onChange={(precoM2Padrao) => alterar({ precoM2Padrao })} erro={erros.precoM2Padrao} />
            <CampoTexto rotulo="Aplicação por m²" sufixo="R$/m²" inputMode="decimal" valor={f.valorAplicacaoM2} onChange={(valorAplicacaoM2) => alterar({ valorAplicacaoM2 })} erro={erros.valorAplicacaoM2} />
            <CampoTexto rotulo="Visita de medição" sufixo="R$" inputMode="decimal" valor={f.valorVisitaMedicao} onChange={(valorVisitaMedicao) => alterar({ valorVisitaMedicao })} erro={erros.valorVisitaMedicao} />
            <CampoTexto rotulo="Margem de perda (sobra)" sufixo="%" inputMode="decimal" valor={f.margemPerda} onChange={(margemPerda) => alterar({ margemPerda })} erro={erros.margemPerda} />
            <CampoTexto rotulo="Desconto no Pix" sufixo="%" inputMode="decimal" valor={f.descontoPix} onChange={(descontoPix) => alterar({ descontoPix })} erro={erros.descontoPix} />
          </div>
        </SecaoAdmin>

        <SecaoAdmin titulo="Cidades atendidas" descricao="Onde a loja faz aplicação e visita técnica. A faixa de CEP usa os 5 primeiros números.">
          <ul className="flex flex-col gap-4">
            {f.cidadesAtendidas.map((c, i) => (
              <li key={c.id} data-slot="cidade-admin" className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-3">
                  <CampoTexto rotulo={`Cidade ${i + 1}`} valor={c.nome} onChange={(nome) => alterarCidade(i, { nome })} erro={erros[`cidades.${i}.nome`]} />
                  <CampoTexto rotulo="UF" maxLength={2} valor={c.uf} onChange={(uf) => alterarCidade(i, { uf: uf.toUpperCase() })} erro={erros[`cidades.${i}.uf`]} />
                </div>
                <CampoTexto
                  rotulo="Taxa de deslocamento"
                  ajuda="0 = sem taxa"
                  sufixo="R$"
                  inputMode="decimal"
                  valor={c.taxaDeslocamento}
                  onChange={(taxaDeslocamento) => alterarCidade(i, { taxaDeslocamento })}
                  erro={erros[`cidades.${i}.taxa`]}
                  className="sm:max-w-xs"
                />
                {c.faixasCep.map((fx, j) => (
                  <div key={j} className="flex flex-col gap-1">
                    <div className="grid grid-cols-2 gap-3">
                      <CampoTexto
                        rotulo={`CEP de (faixa ${j + 1})`}
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="38400"
                        valor={fx.inicio}
                        onChange={(inicio) => alterarCidade(i, { faixasCep: c.faixasCep.map((x, k) => (k === j ? { ...x, inicio: inicio.replace(/\D/g, "") } : x)) })}
                      />
                      <CampoTexto
                        rotulo="até"
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="38499"
                        valor={fx.fim}
                        onChange={(fim) => alterarCidade(i, { faixasCep: c.faixasCep.map((x, k) => (k === j ? { ...x, fim: fim.replace(/\D/g, "") } : x)) })}
                      />
                    </div>
                    <ErroCampo>{erros[`cidades.${i}.faixas.${j}`]}</ErroCampo>
                  </div>
                ))}
                <ErroCampo>{erros[`cidades.${i}.faixas`]}</ErroCampo>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => alterarCidade(i, { faixasCep: [...c.faixasCep, { inicio: "", fim: "" }] })}>
                    <PlusIcon aria-hidden />
                    Outra faixa de CEP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => alterar({ cidadesAtendidas: f.cidadesAtendidas.filter((_, j) => j !== i) })}
                  >
                    <Trash2Icon aria-hidden />
                    Remover <span className="sr-only">{c.nome || `cidade ${i + 1}`}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <ErroCampo>{erros.cidades}</ErroCampo>
          <Button variant="outline" className="sm:self-start" onClick={() => alterar({ cidadesAtendidas: [...f.cidadesAtendidas, novaCidade()] })}>
            <PlusIcon aria-hidden />
            Adicionar cidade
          </Button>
        </SecaoAdmin>

        <SecaoAdmin titulo="Frete por região" descricao="Para o resto do Brasil (fora das cidades atendidas).">
          <ul className="grid gap-3 md:grid-cols-2">
            {f.tabelaFrete.map((t, i) => (
              <li key={t.regiao} className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-3">
                <p className="font-bold">{t.regiao === "MG" ? "Minas Gerais (outras cidades)" : t.regiao}</p>
                <div className="grid grid-cols-2 gap-3">
                  <CampoTexto
                    rotulo="Valor"
                    sufixo="R$"
                    inputMode="decimal"
                    valor={t.valor}
                    onChange={(valor) => alterar({ tabelaFrete: f.tabelaFrete.map((x, j) => (j === i ? { ...x, valor } : x)) })}
                    erro={erros[`frete.${t.regiao}.valor`]}
                  />
                  <CampoTexto
                    rotulo="Prazo"
                    sufixo="dias"
                    inputMode="numeric"
                    valor={t.prazoDias}
                    onChange={(prazoDias) => alterar({ tabelaFrete: f.tabelaFrete.map((x, j) => (j === i ? { ...x, prazoDias } : x)) })}
                    erro={erros[`frete.${t.regiao}.prazo`]}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Interruptor
            rotulo="Frete grátis acima de um valor"
            marcado={f.freteGratisLigado}
            onChange={(freteGratisLigado) => alterar({ freteGratisLigado })}
          />
          {f.freteGratisLigado && (
            <CampoTexto
              rotulo="Frete grátis para compras de papel a partir de"
              sufixo="R$"
              inputMode="decimal"
              valor={f.freteGratisAcimaDe}
              onChange={(freteGratisAcimaDe) => alterar({ freteGratisAcimaDe })}
              erro={erros.freteGratisAcimaDe}
              className="sm:max-w-sm"
            />
          )}
        </SecaoAdmin>

        <SecaoAdmin titulo="Contato e loja">
          <CampoTexto
            rotulo="WhatsApp (com 55 e DDD)"
            ajuda={f.whatsapp.replace(/\D/g, "").length >= 12 ? `Aparece assim: ${formatarWhatsapp(f.whatsapp.replace(/\D/g, ""))}` : undefined}
            inputMode="numeric"
            valor={f.whatsapp}
            onChange={(whatsapp) => alterar({ whatsapp })}
            erro={erros.whatsapp}
          />
          <CampoTexto rotulo="Instagram (endereço do perfil)" inputMode="url" valor={f.instagram} onChange={(instagram) => alterar({ instagram })} erro={erros.instagram} />
          <CampoTexto rotulo="Endereço da loja" valor={f.endereco} onChange={(endereco) => alterar({ endereco })} erro={erros.endereco} />
          <CampoTexto rotulo="Texto de atendimento" valor={f.textoAtendimento} onChange={(textoAtendimento) => alterar({ textoAtendimento })} erro={erros.textoAtendimento} />
        </SecaoAdmin>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-border bg-surface-raised/97 shadow-[0_-4px_16px_rgb(0_0_0/0.06)]">
        <div className="container-loja flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className={cn("text-sm font-semibold", mensagem ? "text-success" : "text-foreground-subtle")}>
            {mensagem ?? (alterado ? "Há alterações não salvas." : "Nada alterado.")}
          </p>
          <Button onClick={salvar}>
            <SaveIcon aria-hidden />
            Salvar configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
