import { expect, test } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

test("layout base: cabeçalho, rodapé e contato", async ({ page }, testInfo) => {
  await page.goto("/")
  await esperarHidratacao(page)

  await expect(page.getByRole("link", { name: /Rodovalho/ }).first()).toBeVisible()
  await expect(page.getByRole("link", { name: /Carrinho, 0 itens/ })).toBeVisible()

  // WhatsApp flutuante
  const flutuante = page.locator("[data-slot=whatsapp-flutuante]")
  await expect(flutuante).toBeVisible()
  await expect(flutuante).toHaveAttribute("href", /^https:\/\/wa\.me\/5534996804044\?text=/)
  await expect(flutuante).toHaveAttribute("target", "_blank")
  await expect(flutuante).toHaveAttribute("rel", "noopener noreferrer")

  // Rodapé
  const rodape = page.locator("footer")
  await expect(rodape.getByRole("link", { name: "WhatsApp (34) 9 9680-4044" })).toHaveAttribute(
    "href",
    "https://wa.me/5534996804044",
  )
  const insta = rodape.getByRole("link", { name: "@rodovalhopapeisdeparede" })
  await expect(insta).toHaveAttribute("href", "https://www.instagram.com/rodovalhopapeisdeparede/")
  await expect(insta).toHaveAttribute("target", "_blank")
  await expect(rodape.getByText("Atendimento presencial somente com hora marcada")).toBeVisible()
  await expect(rodape.getByRole("link", { name: "Agendar pelo WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534996804044\?text=/)
  await expect(rodape.getByText(/Enviamos para todo o Brasil\. Aplicamos em Uberlândia e regiões próximas, como Araguari e Uberaba/)).toBeVisible()
  await expect(rodape.getByText("R$ 60,00 de deslocamento")).toBeVisible()
  await expect(rodape.locator("iframe")).toHaveAttribute("loading", "lazy")
  await expect(rodape.getByRole("link", { name: "Abrir no Google Maps" })).toBeVisible()

  await verificarLayout(page)
  await screenshot(page, testInfo, "fase1-home")
})

test("menu do celular abre, navega e fecha", async ({ page }, testInfo) => {
  test.skip(!ehMobile(testInfo), "menu de gaveta só no celular")
  await page.goto("/")
  await esperarHidratacao(page)

  await page.getByRole("button", { name: "Menu" }).click()
  const menu = page.getByRole("dialog", { name: "Menu" })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole("link", { name: "Pronta entrega" })).toBeVisible()
  await expect(menu.getByRole("link", { name: "@rodovalhopapeisdeparede" })).toBeVisible()
  await expect(menu.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/5534996804044")
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase1-menu", false)

  await menu.getByRole("button", { name: "Fechar" }).click()
  await expect(menu).toBeHidden()
})

test("no computador o menu fica no cabeçalho", async ({ page }, testInfo) => {
  test.skip(ehMobile(testInfo), "só desktop")
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden()
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Papéis de parede" })).toBeVisible()
})
