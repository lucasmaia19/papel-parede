import { expect, test, type Page } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, screenshot, whatsappNaoSobrepoe } from "./helpers"

const item = {
  id: "c-zap",
  produtoId: "p1",
  produtoNome: "Delicado",
  produtoSlug: "delicado",
  imagem: "/img/produtos/delicado.webp",
  cor: { nome: "Rosa", hex: "#E8C9C1" },
  material: { id: "texturizado", nome: "Texturizado linho (não adesivo)" },
  personalizacoes: [],
  paredes: [{ id: "w1", largura: 3, altura: 2.5, aberturas: [] }],
  m2: 8.25,
  m2Parede: 7.5,
  precoM2: 80,
  servicos: { aplicacao: false, visita: false },
  prontaEntrega: false,
  prazoProducaoDias: 7,
}

async function semearCarrinho(page: Page) {
  await page.addInitScript((i) => {
    if (!sessionStorage.getItem("zap-semeado")) {
      localStorage.setItem("rodovalho-loja", JSON.stringify({ state: { carrinho: [i], cep: "01310-100" }, version: 3 }))
      sessionStorage.setItem("zap-semeado", "1")
    }
  }, item)
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(!ehMobile(testInfo), "no celular é onde o botão flutuante disputa espaço com o conteúdo")
  await limparDados(page)
})

for (const [nome, caminho] of [
  ["home", "/"],
  ["produto", "/produtos/delicado"],
  ["carrinho", "/carrinho"],
  ["checkout", "/checkout"],
] as const) {
  test(`WhatsApp flutuante não cobre nada clicável: ${nome}`, async ({ page }, testInfo) => {
    if (nome === "carrinho" || nome === "checkout") await semearCarrinho(page)
    await page.goto(caminho)
    await esperarHidratacao(page)
    const botao = page.locator("[data-slot=whatsapp-flutuante]")
    await expect(botao).toBeVisible()
    await expect(botao).toHaveAccessibleName("Falar no WhatsApp")

    if (nome === "produto") {
      // Acima da barra fixa de preço, sem encostar nela
      const barra = (await page.locator("[data-slot=barra-preco]").boundingBox())!
      const caixa = (await botao.boundingBox())!
      expect(caixa.y + caixa.height).toBeLessThanOrEqual(barra.y - 8)
    }

    await whatsappNaoSobrepoe(page)
    await screenshot(page, testInfo, `ajuste5-whatsapp-${nome}`, false)
  })
}
