import type { Metadata } from "next"
import { AmbientesAdmin } from "@/components/admin/ambientes-admin"

export const metadata: Metadata = { title: "Ambientes" }

export default function AdminAmbientesPage() {
  return <AmbientesAdmin />
}
