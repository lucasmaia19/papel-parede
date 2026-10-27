import type { Metadata, Viewport } from "next"
import { Figtree, Fraunces } from "next/font/google"
import { StoreHydration } from "@/components/store-hydration"
import "./globals.css"

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
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
  themeColor: "#faf8f5",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
