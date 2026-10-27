import { expect, test } from "@playwright/test"
import { esperarHidratacao, limparDados, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

test("trabalhos: foto do trabalho, sem comparação quando não há foto de antes", async ({ page }, testInfo) => {
  await page.goto("/trabalhos")
  await esperarHidratacao(page)
  const trabalhos = page.locator("[data-slot=trabalho]").filter({ visible: true })
  await expect(trabalhos).toHaveCount(1)
  await expect(trabalhos.first()).toContainText("Mural de flores e borboletas no quarto")
  await expect(trabalhos.first().getByRole("img", { name: "Mural de flores e borboletas no quarto" })).toBeVisible()
  // Sem foto de antes: nada de slider
  await expect(trabalhos.first().locator("[data-slot=comparacao]")).toHaveCount(0)
  // Uma cidade só: sem filtro
  await expect(page.getByText("Filtrar por cidade")).toHaveCount(0)
  await expect(page.getByText("1 trabalho", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "Pedir orçamento no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534996804044\?text=/)

  await verificarLayout(page)
  await screenshot(page, testInfo, "fase6-trabalhos")
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
