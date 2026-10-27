import { formatarM2, formatarMoeda, formatarNumero, type LocalEntrega, type ResumoPreco } from "@/lib/pricing"
import { cn } from "@/lib/utils"

interface ResumoPrecoListaProps {
  resumo: ResumoPreco
  local: LocalEntrega
  descontoPixPct: number
  /** Linha do papel: "X m² × R$ …" (só faz sentido para um item) */
  m2?: number
  precoM2?: number
  rotuloPapel?: string
  className?: string
}

function Linha({ rotulo, valor, destaque, sutil }: { rotulo: React.ReactNode; valor: React.ReactNode; destaque?: boolean; sutil?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", sutil && "text-foreground-subtle")}>
      <dt className={cn(destaque && "font-semibold")}>{rotulo}</dt>
      <dd className={cn("text-right tabular-nums", destaque ? "font-bold" : "font-semibold")}>{valor}</dd>
    </div>
  )
}

/** Detalhamento do preço: papel, serviços, deslocamento/frete, total e Pix. */
export function ResumoPrecoLista({
  resumo,
  local,
  descontoPixPct,
  m2,
  precoM2,
  rotuloPapel = "Papel",
  className,
}: ResumoPrecoListaProps) {
  const naRegiao = local?.tipo === "atendida"
  return (
    <div data-slot="resumo-preco" className={cn("flex flex-col gap-4", className)}>
      <dl className="flex flex-col gap-2">
        <Linha
          rotulo={
            <>
              {rotuloPapel}
              {m2 !== undefined && precoM2 !== undefined && m2 > 0 && (
                <span className="block text-sm font-normal text-foreground-subtle">
                  {formatarM2(m2)} × {formatarMoeda(precoM2)}
                </span>
              )}
            </>
          }
          valor={formatarMoeda(resumo.papel)}
        />
        {naRegiao && (
          <>
            <Linha rotulo="Aplicação" valor={resumo.aplicacao > 0 ? formatarMoeda(resumo.aplicacao) : "Não incluída"} sutil={resumo.aplicacao === 0} />
            <Linha rotulo="Visita de medição" valor={resumo.visita > 0 ? formatarMoeda(resumo.visita) : "Não incluída"} sutil={resumo.visita === 0} />
            <Linha
              rotulo={`Deslocamento (${local.cidade.nome})`}
              valor={resumo.deslocamento > 0 ? formatarMoeda(resumo.deslocamento) : "Grátis"}
            />
          </>
        )}
        {local?.tipo === "frete" && (
          <Linha rotulo={`Frete (${local.regiao})`} valor={resumo.freteGratis ? "Grátis" : formatarMoeda(resumo.frete)} />
        )}
        {!local && <Linha rotulo="Entrega" valor="Informe o CEP" sutil />}
      </dl>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-lg font-bold">TOTAL</span>
          <span data-slot="total" className="text-2xl font-bold text-primary tabular-nums">
            {formatarMoeda(resumo.total)}
          </span>
        </div>
        {descontoPixPct > 0 && resumo.total > 0 && (
          <p className="text-right">
            No Pix: <strong className="font-bold tabular-nums">{formatarMoeda(resumo.totalPix)}</strong>{" "}
            <span className="text-foreground-subtle">({formatarNumero(descontoPixPct)}% de desconto)</span>
          </p>
        )}
      </div>

      {naRegiao && resumo.totalSemAplicacao !== null && resumo.totalComAplicacao !== null && resumo.papel > 0 && (
        <div className="grid grid-cols-2 gap-2" data-slot="comparativo-aplicacao">
          <div className="rounded-md border border-border bg-surface-raised p-3">
            <p className="text-sm text-foreground-subtle">Total sem aplicação</p>
            <p className="text-lg font-bold tabular-nums">{formatarMoeda(resumo.totalSemAplicacao)}</p>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-3">
            <p className="text-sm text-foreground-subtle">Total com aplicação</p>
            <p className="text-lg font-bold tabular-nums">{formatarMoeda(resumo.totalComAplicacao)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
