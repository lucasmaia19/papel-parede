import { createOpenAI } from "@ai-sdk/openai"
import { generateImage } from "ai"
import { NextResponse, type NextRequest } from "next/server"

import { LIMITE_SIMULACOES } from "@/lib/simulacao"

/** Contador de simulações por sessão do navegador (cookie de sessão). */
const COOKIE = "rodovalho-simulacoes"
const MODELO = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1"
const TAMANHO_MAX_IMAGEM = 4 * 1024 * 1024 // ~3 MB de imagem em base64

interface Pedido {
  tipo: "estampa" | "parede"
  produto: string
  cor: string
  personalizacoes: string
  observacao: string
  /** Amostra do papel (data URL PNG/JPEG) */
  amostra: string
  /** Foto da parede do cliente (data URL), só no tipo "parede" */
  foto?: string
}

function base64(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(",") + 1)
}

function ehImagem(valor: unknown): valor is string {
  return typeof valor === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(valor) && valor.length < TAMANHO_MAX_IMAGEM
}

function validar(corpo: unknown): Pedido | string {
  if (!corpo || typeof corpo !== "object") return "Pedido inválido."
  const c = corpo as Record<string, unknown>
  if (c.tipo !== "estampa" && c.tipo !== "parede") return "Tipo de simulação inválido."
  if (!ehImagem(c.amostra)) return "Amostra do papel inválida."
  if (c.tipo === "parede" && !ehImagem(c.foto)) return "Envie uma foto da parede (JPG ou PNG)."
  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "")
  return {
    tipo: c.tipo,
    produto: texto(c.produto, 120),
    cor: texto(c.cor, 60),
    personalizacoes: texto(c.personalizacoes, 200),
    observacao: texto(c.observacao, 400),
    amostra: c.amostra,
    foto: c.tipo === "parede" ? (c.foto as string) : undefined,
  }
}

function montarPrompt(p: Pedido): string {
  const produto = `Wallpaper "${p.produto}", color ${p.cor}${p.personalizacoes ? `, options: ${p.personalizacoes}` : ""}.`
  const pedido = p.observacao ? `Customer request (in Brazilian Portuguese): "${p.observacao}".` : ""
  if (p.tipo === "estampa") {
    return [
      "Edit this wallpaper pattern swatch.",
      produto,
      pedido,
      "Keep it a flat, seamless, repeating wallpaper pattern with the same art style and similar scale.",
      "Output only the flat pattern swatch: no room, no furniture, no text, no watermark.",
    ].join(" ")
  }
  return [
    "The first image is a photo of a customer's room. The second image is a wallpaper pattern swatch.",
    "Apply this wallpaper to the main wall(s) in the photo, realistically following the wall perspective, lighting and shadows.",
    "Keep furniture, floor, ceiling, windows, doors, outlets and people unchanged. Do not add text.",
    produto,
    pedido,
  ].join(" ")
}

export async function POST(request: NextRequest) {
  const usadas = Number(request.cookies.get(COOKIE)?.value ?? 0) || 0
  if (usadas >= LIMITE_SIMULACOES) {
    return NextResponse.json(
      {
        erro: `Você já fez ${LIMITE_SIMULACOES} simulações nesta visita. Para ver mais opções, fale com a gente pelo WhatsApp.`,
        restantes: 0,
      },
      { status: 429 },
    )
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 })
  }
  const pedido = validar(corpo)
  if (typeof pedido === "string") return NextResponse.json({ erro: pedido }, { status: 400 })

  const restantes = LIMITE_SIMULACOES - usadas - 1
  const responder = (dados: { imagem: string | null; demonstracao: boolean }) => {
    const resposta = NextResponse.json({ ...dados, restantes })
    // Cookie de sessão (sem validade): zera quando o navegador fecha
    resposta.cookies.set(COOKIE, String(usadas + 1), { httpOnly: true, sameSite: "lax", path: "/" })
    return resposta
  }

  const chave = process.env.OPENAI_API_KEY
  if (!chave) {
    // Sem chave: modo demonstração. Espera um pouco (como a IA faria) e o navegador gera a prévia.
    await new Promise((r) => setTimeout(r, 1200))
    return responder({ imagem: null, demonstracao: true })
  }

  try {
    const openai = createOpenAI({ apiKey: chave })
    const imagens = pedido.tipo === "parede" && pedido.foto ? [base64(pedido.foto), base64(pedido.amostra)] : [base64(pedido.amostra)]
    const { image } = await generateImage({
      model: openai.image(MODELO),
      prompt: { images: imagens, text: montarPrompt(pedido) },
      size: "1024x1024",
      abortSignal: AbortSignal.timeout(90_000),
    })
    return responder({ imagem: `data:${image.mediaType};base64,${image.base64}`, demonstracao: false })
  } catch (erro) {
    console.error("Falha na simulação com IA:", erro)
    return NextResponse.json(
      { erro: "Não conseguimos gerar a simulação agora. Tente de novo em alguns minutos." },
      { status: 502 },
    )
  }
}
