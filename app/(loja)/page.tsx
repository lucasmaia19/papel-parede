import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Home provisória da Fase 1 — substituída na Fase 2 (catálogo).
export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="relative aspect-[4/3] w-full md:aspect-[16/7]">
        <Image
          src="/img/home/hero.svg"
          alt="Sala com papel de parede floral verde atrás de um aparador de madeira"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="container-loja flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-5xl">Papel de parede sob medida para a sua casa</h1>
        <p className="max-w-prose text-foreground-subtle">
          Escolha a estampa, informe as medidas e veja o preço na hora. Enviamos para todo o Brasil.
        </p>
        <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto sm:self-start")}>
          Ver papéis de parede
        </Link>
      </div>
    </div>
  )
}
