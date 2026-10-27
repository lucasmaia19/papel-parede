import type { Metadata } from "next"
import { TrabalhosAdmin } from "@/components/admin/trabalhos-admin"

export const metadata: Metadata = { title: "Trabalhos realizados" }

export default function AdminTrabalhosPage() {
  return <TrabalhosAdmin />
}
