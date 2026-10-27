import { expect, test } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

const cards = (page: import("@playwright/test").Page) =>
  page.locator("main [data-slot=produto-card]").filter({ visible: true })

test("home mostra chamadas, estilos, destaques e trabalhos", async ({ page }, testInfo) => {
  await page.goto("/")
  await esperarHidratacao(page)

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByText(/Enviamos para todo o Brasil/).first()).toBeVisible()
  await expect(page.locator("[data-slot=faixa-entrega]")).toContainText("Aplicamos em Uberlândia, Araguari, Uberaba e região")
  for (const titulo of ["Para qual ambiente?", "Calcule seu papel de parede", "Veja na sua parede", "Pronta entrega", "Escolha pelo estilo", "Mais procurados", "Trabalhos realizados"]) {
    await expect(page.getByRole("heading", { name: titulo, exact: true })).toBeVisible()
  }
  await expect(cards(page)).toHaveCount(4)
  await expect(cards(page).first()).toContainText("/m²")

  await verificarLayout(page)
  await screenshot(page, testInfo, "fase2-home")

  await page.getByRole("link", { name: "Infantis" }).click()
  await expect(page).toHaveURL(/\/produtos\?categoria=infantil/)
  await expect(cards(page)).toHaveCount(1)
})

test("catálogo filtra por estilo e cor", async ({ page }, testInfo) => {
  await page.goto("/produtos")
  await esperarHidratacao(page)
  await expect(cards(page)).toHaveCount(13)
  await expect(page.getByText("13 papéis encontrados")).toBeVisible()
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase2-produtos")

  if (ehMobile(testInfo)) {
    await page.getByRole("button", { name: "Mais filtros" }).click()
    const gaveta = page.getByRole("dialog", { name: "Mais filtros" })
    await expect(gaveta).toBeVisible()
    await gaveta.getByRole("button", { name: "Florais" }).click()
    await expect(page).toHaveURL(/categoria=floral/)
    await verificarLayout(page)
    await screenshot(page, testInfo, "fase2-filtros", false)
    await gaveta.getByRole("button", { name: "Ver 3 papéis" }).click()
    await expect(gaveta).toBeHidden()
  } else {
    await page.getByRole("complementary", { name: "Mais filtros" }).getByRole("button", { name: "Florais" }).click()
    await expect(page).toHaveURL(/categoria=floral/)
  }

  await expect(cards(page)).toHaveCount(3)
  // A ordem é aleatória (estável na sessão): confere só quem aparece
  await expect(cards(page).filter({ hasText: "Delicado" })).toHaveCount(1)
  await expect(page.getByRole("button", { name: "Mais filtros (1)" }).or(page.getByRole("complementary"))).toBeVisible()

  // Filtro de cor junto com estilo → nenhum resultado e opção de ver todos
  await page.goto("/produtos?categoria=floral&cor=lilas")
  await expect(page.getByText("Ainda não temos papéis cadastrados para essa combinação.")).toBeVisible()
  await page.locator("[data-slot=sem-resultado]").getByRole("button", { name: "Limpar filtros" }).click()
  await expect(cards(page)).toHaveCount(13)

  await page.goto("/produtos?cor=off-white")
  await expect(cards(page)).toHaveCount(1)
  await page.getByRole("button", { name: "Limpar filtros" }).click()
  await expect(cards(page)).toHaveCount(13)
})

test("pronta entrega mostra só produtos de envio imediato", async ({ page }, testInfo) => {
  await page.goto("/pronta-entrega")
  await esperarHidratacao(page)
  await expect(page.getByRole("heading", { level: 1, name: "Pronta entrega" })).toBeVisible()
  await expect(cards(page)).toHaveCount(1)
  for (const card of await cards(page).all()) {
    await expect(card.getByText("Pronta entrega")).toBeVisible()
  }
  await expect(page.getByText(/Linho com textura nas cores branco e off-white \(sem estampa\)/)).toBeVisible()
  await expect(cards(page).first()).toContainText("Linho texturizado Off-white")
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase2-pronta-entrega")
})
