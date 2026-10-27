import type { Metadata } from "next"
import { GaleriaTrabalhos } from "@/components/trabalhos/galeria-trabalhos"

export const metadata: Metadata = {
  title: "Trabalhos realizados",
  description: "Antes e depois de paredes com papel de parede aplicado pela Rodovalho em Uberlândia e região.",
}

export default function TrabalhosPage() {
  return (
    <div className="container-loja flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl">Trabalhos realizados</h1>
        <p className="max-w-prose text-foreground-subtle">
          Paredes que transformamos em Uberlândia e região. Arraste a alça sobre cada foto para ver o antes e o depois.
        </p>
      </header>
      <GaleriaTrabalhos />
    </div>
  )
}
