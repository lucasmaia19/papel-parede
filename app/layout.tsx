import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import { StoreHydration } from "@/components/store-hydration"
import "./globals.css"

// Texto e botões: sans fina e legível (nunca bold pesado: no máximo 500)
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
})

// Títulos: serifada leve
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Rodovalho Papéis de Parede — Uberlândia",
    template: "%s | Rodovalho Papéis de Parede",
  },
  description:
    "Papéis de parede sob medida. Enviamos para todo o Brasil e aplicamos em Uberlândia, Araguari, Uberaba e região.",
}

export const viewport: Viewport = {
  themeColor: "#fbf7f3",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jost.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
