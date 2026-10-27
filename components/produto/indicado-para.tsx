"use client"

import Link from "next/link"
import { Fragment } from "react"
import { hrefAmbiente, indicacoesProduto } from "@/lib/ambientes"
import { useLoja } from "@/lib/store"
import type { Product } from "@/types"

const classeLink = "underline decoration-rose underline-offset-4 outline-none hover:text-primary focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"

/** "Indicado para: Quarto (Bebê, Menina) • Brinquedoteca" — cada item leva ao catálogo filtrado. */
export function IndicadoPara({ produto }: { produto: Product }) {
  const ambientes = useLoja((s) => s.ambientes)
  const indicacoes = indicacoesProduto(produto, ambientes)
  if (indicacoes.length === 0) return null
  return (
    <p data-slot="indicado-para" className="leading-loose text-foreground-subtle">
      <span className="font-medium text-foreground">Indicado para: </span>
      {indicacoes.map(({ ambiente, opcoes }, i) => (
        <Fragment key={ambiente.id}>
          {i > 0 && <span aria-hidden>{" • "}</span>}
          <Link href={hrefAmbiente(ambiente)} className={classeLink}>
            {ambiente.nome}
          </Link>
          {opcoes.length > 0 && (
            <>
              {" ("}
              {opcoes.map((o, j) => (
                <Fragment key={o.id}>
                  {j > 0 && ", "}
                  <Link href={hrefAmbiente(ambiente, o.grupo, o.slug)} className={classeLink}>
                    {o.nome}
                  </Link>
                </Fragment>
              ))}
              {")"}
            </>
          )}
        </Fragment>
      ))}
    </p>
  )
}
