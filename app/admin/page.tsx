import type { Metadata } from "next"
import { Painel } from "@/components/admin/painel"

export const metadata: Metadata = { title: "Painel" }

export default function AdminPage() {
  return <Painel />
}
