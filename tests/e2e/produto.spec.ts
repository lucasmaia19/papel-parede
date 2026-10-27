import { expect, test, type Page } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, nadaCobreBotoes, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

const conteudo = (page: Page) => page.locator("main")
const total = (page: Page) => page.locator("main [data-slot=resumo-preco]").filter({ visible: true }).first().locator("[data-slot=total]")

async function digitarMedida(page: Page, indice: number, largura: string, altura: string) {
  const parede = page.locator("[data-slot=parede]").nth(indice)
  await parede.getByLabel("Largura").first().fill(largura)
  await parede.getByLabel("Altura").first().fill(altura)
}

test("régua, cor e personalização", async ({ page }, testInfo) => {
  await page.goto("/produtos/xadrez-vichy")
  await esperarHidratacao(page)

  await expect(page.getByRole("heading", { level: 1, name: "Xadrez Vichy" })).toBeVisible()
  await expect(page.locator("[data-slot=prazo]")).toHaveText("Produção em 7 dias úteis + entrega")

  await page.getByRole("button", { name: "Mostrar régua" }).click()
  await expect(page.locator("[data-slot=regua]")).toBeVisible()
  await expect(page.getByText("Cada quadrado: 10 cm × 10 cm")).toBeVisible()
  await expect(page.getByRole("button", { name: "Ocultar régua" })).toBeVisible()
  await page.locator("[data-slot=galeria]").scrollIntoViewIfNeeded()
  await screenshot(page, testInfo, "fase3-regua", false)

  await conteudo(page).getByRole("button", { name: "Verde", exact: true }).click()
  await expect(page.locator("[data-slot=galeria] img").first()).toHaveAttribute("src", /xadrez-vichy-verde/)

  await conteudo(page).getByRole("button", { name: /^5 cm/ }).click()
  await expect(page.getByRole("heading", { level: 1 }).locator("..").getByText("R$ 88,00")).toBeVisible()
  await conteudo(page).getByRole("button", { name: /^10 cm/ }).click()
  await expect(page.getByRole("heading", { level: 1 }).locator("..").getByText("R$ 80,00")).toBeVisible()
})

test("calculadora, CEP da região, frete e carrinho", async ({ page }, testInfo) => {
  await page.goto("/produtos/xadrez-vichy")
  await esperarHidratacao(page)

  await expect(page.getByText("Você está aqui")).toBeVisible()
  await digitarMedida(page, 0, "3,20", "2.60")
  const resultado = page.locator("[data-slot=resultado-metragem]")
  await expect(resultado).toContainText("8,32 m²")
  await expect(resultado).toContainText("9,16 m²")

  // Janela 1,20 × 1,00 (valor sugerido)
  await page.getByRole("button", { name: "+ Janela" }).click()
  await expect(resultado).toContainText("− 1,2 m²")
  await expect(resultado).toContainText("7,84 m²")
  await expect(resultado).toContainText("R$ 627,20")
  await expect(total(page)).toHaveText("R$ 627,20")

  // Duas paredes
  await page.getByRole("button", { name: "Adicionar outra parede" }).click()
  await digitarMedida(page, 1, "2", "2,6")
  await expect(resultado).toContainText("13,56 m²") // (7,12 + 5,2) × 1,1 = 13,552
  await page.getByRole("button", { name: "Remover Parede 2" }).click()
  await expect(resultado).toContainText("7,84 m²")

  // CEP de Uberlândia → serviços
  await page.getByLabel("Digite seu CEP").fill("38408610")
  await page.getByRole("button", { name: "Calcular" }).click()
  await expect(page.getByText("Atendemos Uberlândia!")).toBeVisible()
  const servicos = page.locator("[data-slot=servicos-regiao]")
  await servicos.getByRole("group", { name: /aplique/ }).getByRole("button", { name: "Sim, quero" }).click()
  await servicos.getByRole("group", { name: /visita/ }).getByRole("button", { name: "Sim, quero" }).click()
  // 627,20 + aplicação 7,12 × 25 = 178 + visita 50 + deslocamento 0
  await expect(total(page)).toHaveText("R$ 855,20")
  await expect(page.getByText("R$ 812,44").filter({ visible: true }).first()).toBeVisible()
  const comparativo = page.locator("main [data-slot=comparativo-aplicacao]").filter({ visible: true }).first()
  await expect(comparativo).toContainText("R$ 677,20")
  await expect(comparativo).toContainText("R$ 855,20")

  await verificarLayout(page)
  await nadaCobreBotoes(page)
  await screenshot(page, testInfo, "fase3-produto-regiao")

  // CEP de São Paulo → frete
  await page.getByRole("button", { name: "Trocar CEP" }).click()
  await page.getByLabel("Digite seu CEP").fill("01310-100")
  await page.getByRole("button", { name: "Calcular" }).click()
  await expect(page.getByText("Entrega para SP: R$ 45,00")).toBeVisible()
  await expect(page.getByText(/Aplicação e visita técnica disponíveis apenas em Uberlândia e região/)).toBeVisible()
  await expect(total(page)).toHaveText("R$ 672,20")

  if (ehMobile(testInfo)) {
    const barra = page.locator("[data-slot=barra-preco]")
    await expect(barra).toContainText("R$ 672,20")
    await barra.getByRole("button", { name: "Ver detalhes" }).click()
    const detalhes = page.getByRole("dialog", { name: "Detalhes do preço" })
    await expect(detalhes).toContainText("Frete (Sudeste)")
    await screenshot(page, testInfo, "fase3-detalhes", false)
    await detalhes.getByRole("button", { name: "Adicionar ao carrinho" }).click()
  } else {
    await page.getByRole("complementary", { name: "Resumo do preço" }).getByRole("button", { name: "Adicionar ao carrinho" }).click()
  }
  await expect(page.getByRole("dialog", { name: "Adicionado ao carrinho" })).toBeVisible()
  await page.getByRole("button", { name: "Continuar escolhendo" }).click()
  await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible()
})

test("avisa quando falta medida e mostra o guia de medição", async ({ page }, testInfo) => {
  await page.goto("/produtos/borboletas")
  await esperarHidratacao(page)
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).filter({ visible: true }).first().click()
  await expect(page.getByRole("alert").filter({ hasText: "digite a largura e a altura" })).toBeVisible()

  await page.getByRole("button", { name: "Como medir sua parede?" }).click()
  const guia = page.getByRole("dialog", { name: "Como medir sua parede" })
  await expect(guia.getByRole("heading", { name: "1. Meça a largura" })).toBeVisible()
  await expect(guia.getByRole("heading", { name: "3. Anote portas e janelas" })).toBeVisible()
  await expect(guia.getByText(/fazemos a visita técnica para medir para você/)).toBeVisible()
  await expect(guia.getByRole("link", { name: "Agendar visita pelo WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534996804044\?text=/)
  await screenshot(page, testInfo, "fase3-guia", false)
  await guia.getByRole("button", { name: "Entendi, voltar" }).click()

  // Mensagem de dúvidas no WhatsApp leva produto e cor
  const duvidas = page.getByRole("link", { name: "Tirar dúvidas no WhatsApp" }).filter({ visible: true }).first()
  const href = decodeURIComponent((await duvidas.getAttribute("href")) ?? "")
  expect(href).toContain("Borboletas")
  expect(href).toContain("Cor: Azul")
})

test("produto pronta entrega mostra envio imediato", async ({ page }, testInfo) => {
  await page.goto("/produtos/liso-fosco")
  await esperarHidratacao(page)
  await expect(page.locator("[data-slot=prazo]")).toHaveText("Pronta entrega — envio imediato")
  if (!ehMobile(testInfo)) {
    // Com a página no topo, nada pode cobrir o card lateral (ex.: WhatsApp flutuante)
    await expect(page.locator("[data-slot=whatsapp-flutuante]")).toBeHidden()
    await nadaCobreBotoes(page, "aside")
  }
  await verificarLayout(page)
  await nadaCobreBotoes(page)
  await screenshot(page, testInfo, "fase3-pronta-entrega")
})
