import { expect, test, type Page } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, nadaCobreBotoes, screenshot, verificarLayout } from "./helpers"

const itemExemplo = {
  id: "c-teste",
  produtoId: "p3",
  produtoNome: "Xadrez Vichy",
  produtoSlug: "xadrez-vichy",
  imagem: "/img/produtos/xadrez-vichy-azul.svg",
  cor: { nome: "Azul", hex: "#5F84AA" },
  personalizacoes: [{ grupo: "Tamanho do quadrado", opcao: "10 cm", acrescimoM2: 0 }],
  paredes: [{ id: "w1", largura: 3.2, altura: 2.6, aberturas: [{ id: "a1", tipo: "janela", largura: 1.2, altura: 1 }] }],
  m2: 7.84,
  m2Parede: 7.12,
  precoM2: 80,
  servicos: { aplicacao: false, visita: false },
  simulacao: { tipo: "estampa", observacao: "Trocar o azul por amarelo-mostarda" },
  prontaEntrega: false,
  prazoProducaoDias: 7,
}

/** Coloca itens no carrinho direto no armazenamento do navegador (o store mescla com os dados iniciais). */
async function semearCarrinho(page: Page, cep = "") {
  await page.addInitScript(
    ({ item, cep }) => {
      if (!sessionStorage.getItem("carrinho-semeado")) {
        localStorage.setItem("rodovalho-loja", JSON.stringify({ state: { carrinho: [item], cep }, version: 1 }))
        sessionStorage.setItem("carrinho-semeado", "1")
      }
    },
    { item: itemExemplo, cep },
  )
}

/** Captura o link aberto por window.open (sem abrir o WhatsApp de verdade). */
async function capturarWindowOpen(page: Page) {
  await page.addInitScript(() => {
    window.open = ((url?: string | URL) => {
      ;(window as unknown as { __aberto: string }).__aberto = String(url)
      return null
    }) as typeof window.open
  })
}

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

test("compra completa pelo site", async ({ page }, testInfo) => {
  // Produto → carrinho
  await page.goto("/produtos/listrado-classico")
  await esperarHidratacao(page)
  const parede = page.locator("[data-slot=parede]").first()
  await parede.getByRole("textbox", { name: "Largura" }).fill("3")
  await parede.getByRole("textbox", { name: "Altura" }).fill("2,5")
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).filter({ visible: true }).first().click()
  await page.getByRole("link", { name: "Ver carrinho" }).click()

  // Carrinho: 3 × 2,5 = 7,5 → 8,25 m² → R$ 660,00
  await expect(page.getByRole("heading", { level: 1, name: "Seu carrinho" })).toBeVisible()
  const item = page.locator("[data-slot=item-carrinho]")
  await expect(item).toContainText("Listrado Clássico")
  await expect(item).toContainText("Azul")
  await expect(item).toContainText("Largura da listra: 5 cm")
  await expect(item).toContainText("8,25 m²")
  await expect(item).toContainText("R$ 660,00")

  // Editar medidas
  await item.getByRole("button", { name: "Editar medidas" }).click()
  const edicao = page.getByRole("dialog", { name: /Medidas/ })
  await edicao.getByRole("textbox", { name: "Largura" }).first().fill("4")
  await edicao.getByRole("button", { name: "Salvar medidas" }).click()
  await expect(item).toContainText("11 m²") // 4 × 2,5 = 10 → 11
  await expect(item).toContainText("R$ 880,00")

  // CEP de Araguari: deslocamento R$ 60 + aplicação
  await page.getByLabel("Digite seu CEP").filter({ visible: true }).fill("38440-000")
  await page.getByRole("button", { name: "Calcular" }).click()
  await expect(page.getByText("Atendemos Araguari!")).toBeVisible()
  await page.locator("[data-slot=servicos-regiao]").getByRole("group", { name: /aplique/ }).getByRole("button", { name: "Sim, quero" }).click()
  await page.locator("[data-slot=servicos-regiao]").getByRole("group", { name: /visita/ }).getByRole("button", { name: "Não precisa" }).click()
  // 880 + aplicação 10 × 25 = 250 + deslocamento 60 = 1190
  await expect(page.locator("[data-slot=total]").filter({ visible: true }).first()).toHaveText("R$ 1.190,00")
  await expect(page.getByRole("link", { name: "Finalizar compra no site" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Finalizar pelo WhatsApp" })).toBeVisible()
  await verificarLayout(page)
  await nadaCobreBotoes(page)
  await screenshot(page, testInfo, "fase4-carrinho")

  // Checkout — passo 1
  await page.getByRole("link", { name: "Finalizar compra no site" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible()
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Digite seu nome completo.")).toBeVisible()
  await expect(page.getByText(/Digite o telefone com DDD/)).toBeVisible()
  await screenshot(page, testInfo, "fase4-checkout-dados", false)
  await page.getByLabel("Nome completo").fill("Maria das Graças")
  await page.getByLabel("Telefone / WhatsApp").fill("34999998888")
  await expect(page.getByLabel("Telefone / WhatsApp")).toHaveValue("(34) 9 9999-8888")
  await page.getByRole("button", { name: "Continuar" }).click()

  // Passo 2 — CEP já vem do carrinho; cidade e UF preenchidas
  await expect(page.getByRole("heading", { name: "Endereço", exact: true })).toBeVisible()
  await expect(page.getByLabel("Cidade")).toHaveValue("Araguari")
  await expect(page.getByLabel("UF")).toHaveValue("MG")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Digite a rua.")).toBeVisible()
  await page.getByLabel("Rua").fill("Rua das Flores")
  await expect(page.getByText("Digite a rua.")).toBeHidden()
  await page.getByLabel("Número").fill("120")
  await page.getByLabel("Bairro").fill("Centro")
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase4-checkout-endereco", false)
  await page.getByRole("button", { name: "Continuar" }).click()

  // Passo 3 — Pix com desconto: 1190 × 0,95 = 1130,50
  await expect(page.getByRole("heading", { name: "Pagamento", exact: true })).toBeVisible()
  await expect(page.getByText("R$ 1.130,50 — 5% de desconto")).toBeVisible()
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase4-checkout-pagamento", false)
  await page.getByRole("button", { name: "Confirmar pedido — R$ 1.130,50" }).click()

  // Confirmado
  await expect(page.getByRole("heading", { level: 1, name: "Pedido confirmado!" })).toBeVisible()
  await expect(page.getByText("Pedido nº 1001")).toBeVisible()
  await expect(page.getByText(/Produção em até 7 dias úteis/)).toBeVisible()
  await expect(page.getByRole("link", { name: "Falar com a loja no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534996804044\?text=/)
  await expect(page.getByRole("link", { name: "Carrinho, 0 itens" })).toBeVisible()
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase4-confirmado")
})

test("finalizar pelo WhatsApp envia o orçamento completo", async ({ page }, testInfo) => {
  await semearCarrinho(page, "01310-100")
  await capturarWindowOpen(page)
  await page.goto("/carrinho")
  await esperarHidratacao(page)

  await expect(page.getByText("Entrega para SP: R$ 45,00")).toBeVisible()
  await expect(page.locator("[data-slot=item-carrinho]")).toContainText("Trocar o azul por amarelo-mostarda")
  await page.getByRole("button", { name: "Finalizar pelo WhatsApp" }).click()
  const dialogo = page.getByRole("dialog", { name: "Finalizar pelo WhatsApp" })
  await dialogo.getByRole("button", { name: "Abrir WhatsApp com o orçamento" }).click()
  await expect(dialogo.getByText(/Digite seu nome/)).toBeVisible()
  await dialogo.getByLabel("Seu nome").fill("João")
  if (ehMobile(testInfo)) await screenshot(page, testInfo, "fase4-whatsapp-nome", false)
  await dialogo.getByRole("button", { name: "Abrir WhatsApp com o orçamento" }).click()

  await expect(page.getByRole("heading", { level: 1, name: "Orçamento enviado para o WhatsApp" })).toBeVisible()
  const url = await page.evaluate(() => (window as unknown as { __aberto: string }).__aberto)
  expect(url).toMatch(/^https:\/\/wa\.me\/5534996804044\?text=/)
  const texto = decodeURIComponent(url.split("?text=")[1])
  expect(texto).toContain("*1. Xadrez Vichy*")
  expect(texto).toContain("Cor: Azul")
  expect(texto).toContain("Tamanho do quadrado: 10 cm")
  expect(texto).toContain("Metragem: 7,84 m²")
  expect(texto).toContain("Observação (simulação com IA): Trocar o azul por amarelo-mostarda")
  expect(texto).toContain("CEP: 01310-100 (SP)")
  expect(texto).toContain("Frete (Sudeste)")
  expect(texto).toMatch(/\*Total: R\$\s672,20\*/)
  expect(texto).toMatch(/\*No Pix: R\$\s638,59\*/)
  expect(texto).toContain("Nome: João")
  await expect(page.getByRole("link", { name: "Carrinho, 0 itens" })).toBeVisible()
})

test("remover item pede confirmação", async ({ page }, testInfo) => {
  await semearCarrinho(page)
  await page.goto("/carrinho")
  await esperarHidratacao(page)
  await page.getByRole("button", { name: "Remover Xadrez Vichy" }).click()
  const confirma = page.getByRole("alertdialog", { name: "Remover do carrinho?" })
  await confirma.getByRole("button", { name: "Não, manter" }).click()
  await expect(page.locator("[data-slot=item-carrinho]")).toHaveCount(1)
  await page.getByRole("button", { name: "Remover Xadrez Vichy" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, remover" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Seu carrinho está vazio" })).toBeVisible()
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase4-carrinho-vazio", false)
})
