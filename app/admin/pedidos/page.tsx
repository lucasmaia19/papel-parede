import type { Metadata } from "next"
import { PedidosAdmin } from "@/components/admin/pedidos-admin"

export const metadata: Metadata = { title: "Pedidos" }

export default function AdminPedidosPage() {
  return <PedidosAdmin />
}
