import { expect, test } from "@playwright/test"
import { esperarHidratacao, limparDados, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

test("trabalhos: antes/depois arrastável e filtro por cidade", async ({ page }, testInfo) => {
  await page.goto("/trabalhos")
  await esperarHidratacao(page)
  const trabalhos = page.locator("[data-slot=trabalho]").filter({ visible: true })
  await expect(trabalhos).toHaveCount(4)

  // Arrastar a comparação (pelo controle, como o teclado/leitor de tela faria)
  const primeiro = trabalhos.first()
  const controle = primeiro.getByLabel(/Arraste para comparar/)
  await controle.fill("15")
  await expect(controle).toHaveAttribute("aria-valuetext", "15% antes")
  // Arrastar com o dedo/mouse
  const caixa = (await primeiro.locator("[data-slot=comparacao] > div").first().boundingBox())!
  await page.mouse.move(caixa.x + caixa.width * 0.5, caixa.y + caixa.height / 2)
  await page.mouse.down()
  await page.mouse.move(caixa.x + caixa.width * 0.8, caixa.y + caixa.height / 2, { steps: 5 })
  await page.mouse.up()
  expect(Number(await controle.inputValue())).toBeGreaterThan(60)

  await verificarLayout(page)
  await screenshot(page, testInfo, "fase6-trabalhos")

  await page.getByRole("button", { name: "Araguari", exact: true }).click()
  await expect(trabalhos).toHaveCount(1)
  await expect(trabalhos.first()).toContainText("Quarto de bebê com nuvens")
  await expect(page.getByText("1 trabalho em Araguari")).toBeVisible()
  await page.getByRole("button", { name: "Uberlândia", exact: true }).click()
  await expect(trabalhos).toHaveCount(2)
  await page.getByRole("button", { name: "Todas", exact: true }).click()
  await expect(trabalhos).toHaveCount(4)

  await trabalhos.first().getByRole("link", { name: /Ver o papel Listrado Clássico/ }).click()
  await expect(page).toHaveURL(/\/produtos\/listrado-classico/)
})

test("contato: WhatsApp, Instagram, endereço, hora marcada e mapa", async ({ page }, testInfo) => {
  await page.goto("/contato")
  await esperarHidratacao(page)
  const main = page.locator("main")
  await expect(main.getByRole("heading", { level: 1, name: "Contato" })).toBeVisible()

  const whatsapp = main.getByRole("link", { name: "WhatsApp (34) 9 9680-4044" })
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/5534996804044/)
  await expect(whatsapp).toHaveAttribute("target", "_blank")
  await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer")
  await expect(main.getByRole("link", { name: "@rodovalhopapeisdeparede" })).toHaveAttribute(
    "href",
    "https://www.instagram.com/rodovalhopapeisdeparede/",
  )
  await expect(main.getByText("R. José Joaquim Francisco, 229 - Vigilato Pereira, Uberlândia - MG, 38408-610")).toBeVisible()
  await expect(main.getByText("Atendimento presencial somente com hora marcada")).toBeVisible()
  await expect(main.getByRole("link", { name: "Agendar pelo WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534996804044\?text=/)
  await expect(main.getByText("R$ 90,00 de deslocamento")).toBeVisible()

  const mapa = main.locator("iframe")
  await expect(mapa).toHaveAttribute("loading", "lazy")
  await expect(mapa).toHaveAttribute("src", /google\.com\/maps\?q=.*output=embed/)
  await expect(main.getByRole("link", { name: "Abrir no Google Maps" })).toHaveAttribute("target", "_blank")

  await verificarLayout(page)
  await screenshot(page, testInfo, "fase6-contato")
})
