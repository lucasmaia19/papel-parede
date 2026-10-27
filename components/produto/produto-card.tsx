import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { imagemPrincipal } from "@/lib/catalogo"
import { formatarMoeda } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProdutoCardProps {
  produto: Product
  className?: string
  prioridade?: boolean
}

/** Card minimalista: foto grande, nome e preço por m². O card inteiro é o link. */
export function ProdutoCard({ produto, className, prioridade }: ProdutoCardProps) {
  return (
    <article data-slot="produto-card" className={cn("group relative flex flex-col gap-3", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-muted">
        <Image
          src={imagemPrincipal(produto)}
          alt=""
          fill
          priority={prioridade}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {produto.prontaEntrega && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Pronta entrega
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-base leading-snug font-semibold">
          <Link
            href={`/produtos/${produto.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/60"
          >
            {produto.nome}
          </Link>
        </h3>
        <p className="text-foreground-subtle">
          <span className="font-semibold text-foreground">{formatarMoeda(produto.precoM2)}</span>/m²
        </p>
        <div className="flex gap-1.5" aria-label={`Cores: ${produto.cores.map((c) => c.nome).join(", ")}`}>
          {produto.cores.map((c) => (
            <span
              key={c.id}
              title={c.nome}
              className="size-4 rounded-[2px] border border-foreground/25"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

export function GradeProdutos({ produtos, className }: { produtos: Product[]; className?: string }) {
  return (
    <ul
      data-slot="grade-produtos"
      className={cn("grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6", className)}
    >
      {produtos.map((p, i) => (
        <li key={p.id}>
          <ProdutoCard produto={p} prioridade={i < 2} />
        </li>
      ))}
    </ul>
  )
}
