"use client"

import { useId, useState } from "react"
import { MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cepValido, consultarCep, formatarCep, type ResultadoCep } from "@/lib/cep"
import { useLoja } from "@/lib/store"

interface CampoCepProps {
  /** CEP confirmado (vazio = ainda não informado) */
  cep: string
  onConfirmar: (cep: string) => void
  rotulo?: string
}

/** Campo grande de CEP + botão. Mostra erro em linguagem simples. */
export function CampoCep({ cep, onConfirmar, rotulo = "Digite seu CEP" }: CampoCepProps) {
  const id = useId()
  const cidades = useLoja((s) => s.settings.cidadesAtendidas)
  const [editando, setEditando] = useState(!cep)
  const [valor, setValor] = useState(cep)
  const [erro, setErro] = useState<string | null>(null)

  // CEP mudou fora daqui (ex.: carregou do navegador): mostra o novo
  const [cepAnterior, setCepAnterior] = useState(cep)
  if (cepAnterior !== cep) {
    setCepAnterior(cep)
    setValor(cep)
    setEditando(!cep)
  }

  function confirmar(e: React.FormEvent) {
    e.preventDefault()
    if (!cepValido(valor)) {
      setErro("O CEP tem 8 números. Exemplo: 38408-610")
      return
    }
    if (!consultarCep(valor, cidades)) {
      setErro("Não encontramos esse CEP. Confira os números.")
      return
    }
    setErro(null)
    setEditando(false)
    onConfirmar(formatarCep(valor))
  }

  if (!editando && cep) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-raised p-3 pl-4">
        <p className="flex items-center gap-2">
          <MapPinIcon className="size-5 shrink-0" aria-hidden />
          <span>
            CEP <strong className="font-semibold tabular-nums">{cep}</strong>
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          Trocar CEP
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={confirmar} className="flex flex-col gap-2" noValidate>
      <label htmlFor={id} className="font-semibold">
        {rotulo}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          value={valor}
          onChange={(e) => {
            setValor(formatarCep(e.target.value))
            setErro(null)
          }}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className="min-w-0 flex-1 text-xl tracking-wide tabular-nums"
        />
        <Button type="submit" size="lg" className="shrink-0">
          Calcular
        </Button>
      </div>
      {erro && (
        <p id={`${id}-erro`} role="alert" className="font-medium text-destructive">
          {erro}
        </p>
      )}
    </form>
  )
}

export function useResultadoCep(cep: string): ResultadoCep | null {
  const cidades = useLoja((s) => s.settings.cidadesAtendidas)
  return cep ? consultarCep(cep, cidades) : null
}
