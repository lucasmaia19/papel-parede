"use client"

/** Utilitários de imagem no navegador (canvas): comprimir, converter e gerar a prévia de demonstração. */

export function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Não foi possível abrir a imagem."))
    img.src = src
  })
}

export function lerArquivo(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."))
    leitor.readAsDataURL(arquivo)
  })
}

function canvasDoTamanho(largura: number, altura: number) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(largura))
  canvas.height = Math.max(1, Math.round(altura))
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas indisponível")
  return { canvas, ctx }
}

/**
 * Redimensiona (maior lado = maxLado) e comprime. Usado antes de enviar fotos
 * e antes de guardar a simulação no carrinho (localStorage tem pouco espaço).
 */
export async function comprimirImagem(
  src: string,
  { maxLado = 1024, qualidade = 0.8, tipo = "image/jpeg" }: { maxLado?: number; qualidade?: number; tipo?: string } = {},
): Promise<string> {
  const img = await carregarImagem(src)
  const largura = img.naturalWidth || img.width || maxLado
  const altura = img.naturalHeight || img.height || maxLado
  const escala = Math.min(1, maxLado / Math.max(largura, altura))
  const { canvas, ctx } = canvasDoTamanho(largura * escala, altura * escala)
  if (tipo === "image/jpeg") {
    ctx.fillStyle = "#fbf7f3"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL(tipo, qualidade)
}

/** Converte qualquer imagem (inclusive SVG) em PNG quadrado — formato aceito pelo modelo de imagem. */
export function paraPng(src: string, lado = 1024): Promise<string> {
  return comprimirImagem(src, { maxLado: lado, tipo: "image/png" })
}

function hashTexto(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Prévia de DEMONSTRAÇÃO (sem IA): usada quando a loja ainda não configurou a chave da API.
 * - estampa: a amostra com as cores deslocadas conforme o pedido
 * - parede: o papel "aplicado" sobre a parte de cima da foto (multiplicação de cores)
 */
export async function gerarPreviaDemonstracao(dados: {
  tipo: "estampa" | "parede"
  amostra: string
  foto?: string
  observacao: string
}): Promise<string> {
  const amostra = await carregarImagem(dados.amostra)

  if (dados.tipo === "estampa" || !dados.foto) {
    const lado = 720
    const { canvas, ctx } = canvasDoTamanho(lado, lado)
    const giro = dados.observacao.trim() ? 25 + (hashTexto(dados.observacao) % 270) : 0
    ctx.filter = `hue-rotate(${giro}deg) saturate(1.15)`
    ctx.drawImage(amostra, 0, 0, lado, lado)
    return canvas.toDataURL("image/jpeg", 0.85)
  }

  const foto = await carregarImagem(dados.foto)
  const escala = Math.min(1, 1024 / Math.max(foto.naturalWidth, foto.naturalHeight))
  const w = foto.naturalWidth * escala
  const h = foto.naturalHeight * escala
  const { canvas, ctx } = canvasDoTamanho(w, h)
  ctx.drawImage(foto, 0, 0, w, h)

  // Ladrilho da amostra num tamanho plausível (a amostra tem 60 cm; a parede ~ 2,6 m na altura da foto)
  const ladoLadrilho = Math.max(48, (h * 0.75 * 60) / 260)
  const { canvas: ladrilho, ctx: ctxL } = canvasDoTamanho(ladoLadrilho, ladoLadrilho)
  ctxL.drawImage(amostra, 0, 0, ladoLadrilho, ladoLadrilho)
  const padrao = ctx.createPattern(ladrilho, "repeat")
  if (padrao) {
    const alturaParede = h * 0.72
    ctx.save()
    ctx.globalCompositeOperation = "multiply"
    ctx.globalAlpha = 0.9
    ctx.fillStyle = padrao
    ctx.fillRect(0, 0, w, alturaParede)
    ctx.restore()
  }
  return canvas.toDataURL("image/jpeg", 0.85)
}
