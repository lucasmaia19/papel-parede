import type { Metadata } from "next"
import { ConfiguracoesAdmin } from "@/components/admin/configuracoes-admin"

export const metadata: Metadata = { title: "Configurações" }

export default function AdminConfiguracoesPage() {
  return <ConfiguracoesAdmin />
}
