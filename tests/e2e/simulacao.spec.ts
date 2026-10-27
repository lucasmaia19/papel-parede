import { expect, test } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, nadaCobreBotoes, screenshot, verificarLayout } from "./helpers"

// PNG 1×1 válido, para testar a API
const PNG_MINIMO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

test("simulação com IA nas duas abas e envio para o carrinho", async ({ page }, testInfo) => {
  await page.goto("/produtos/delicado")
  await esperarHidratacao(page)

  const secao = page.locator("[data-slot=simulacao-ia]")
  await expect(page.getByRole("heading", { name: /Veja antes de comprar/ })).toBeVisible()

  // Aba 1 — personalizar a estampa
  await expect(secao.getByRole("tab", { name: "Personalizar a estampa" })).toHaveAttribute("aria-selected", "true")
  await expect(secao.locator("[data-slot=aviso-ia]").filter({ visible: true })).toContainText(
    "Esta é uma simulação aproximada feita por inteligência artificial",
  )
  await secao.getByRole("button", { name: "Trocar as flores azuis por rosas" }).click()
  await expect(secao.getByLabel(/O que você gostaria de mudar/)).toHaveValue("Trocar as flores azuis por rosas")
  await secao.getByRole("button", { name: "Ver simulação" }).click()
  await expect(secao.getByText(/Gerando a simulação/)).toBeVisible()
  const resultado = secao.locator("[data-slot=resultado-simulacao]")
  await expect(resultado).toBeVisible({ timeout: 15_000 })
  if (ehMobile(testInfo)) {
    await expect(resultado.getByText("Original", { exact: true }).filter({ visible: true })).toBeVisible()
    await expect(resultado.getByText("Simulação", { exact: true }).filter({ visible: true })).toBeVisible()
  } else {
    await expect(resultado.locator("[data-slot=comparacao]")).toBeVisible()
    await resultado.getByLabel(/Arraste para comparar/).fill("20")
  }
  await expect(resultado).toContainText("Modo demonstração")
  await expect(secao.getByText(/Você ainda pode fazer \d simulações/)).toBeVisible()
  await expect(secao.getByText("A simulação e a observação vão junto com o pedido.")).toBeVisible()
  await secao.scrollIntoViewIfNeeded()
  await screenshot(page, testInfo, "fase5-estampa", false)

  // Aba 2 — veja na sua parede
  await secao.getByRole("tab", { name: "Veja na sua parede" }).click()
  await expect(secao.locator("[data-slot=aviso-ia]").filter({ visible: true })).toBeVisible()
  await expect(secao.locator("[data-slot=entrada-camera]")).toHaveAttribute("capture", "environment")
  await secao.getByRole("button", { name: "Ver na minha parede" }).click()
  await expect(secao.getByRole("alert")).toHaveText("Primeiro tire ou escolha uma foto da sua parede.")

  // Foto de exemplo: uma parede lisa
  await secao.locator("[data-slot=entrada-galeria]").setInputFiles("public/img/produtos/cimento-queimado-areia.webp")
  await expect(secao.getByRole("img", { name: "Foto da sua parede" })).toBeVisible()
  await secao.getByRole("button", { name: "Ver na minha parede" }).click()
  await expect(secao.locator("[data-slot=resultado-simulacao]")).toBeVisible({ timeout: 15_000 })
  await expect(secao.locator("[data-slot=resultado-simulacao]").getByText("Sua foto", { exact: true }).filter({ visible: true })).toBeVisible()
  await verificarLayout(page)
  await nadaCobreBotoes(page, "[data-slot=simulacao-ia]")
  await screenshot(page, testInfo, "fase5-parede")

  // Vai para o carrinho junto com o item
  const parede = page.locator("[data-slot=parede]").first()
  await parede.getByRole("textbox", { name: "Largura" }).fill("2")
  await parede.getByRole("textbox", { name: "Altura" }).fill("2,5")
  await page.getByRole("button", { name: /^Adesivo liso/ }).click()
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).filter({ visible: true }).first().click()
  await page.getByRole("link", { name: "Ver carrinho" }).click()
  const item = page.locator("[data-slot=item-carrinho]")
  await expect(item).toContainText("Simulação com IA")
  await expect(item).toContainText("Trocar as flores azuis por rosas")
  await expect(item.getByRole("img", { name: "Simulação feita com IA" })).toBeVisible()
})

test("produto sem IA não mostra a simulação", async ({ page }) => {
  await page.goto("/produtos/linho-texturizado-off-white")
  await esperarHidratacao(page)
  await expect(page.getByRole("heading", { level: 1, name: "Linho texturizado Off-white" })).toBeVisible()
  await expect(page.locator("[data-slot=simulacao-ia]")).toHaveCount(0)
})

test("API: valida o pedido e limita simulações por sessão", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "teste de API roda uma vez só")

  const semFoto = await request.post("/api/simular", { data: { tipo: "parede", amostra: PNG_MINIMO } })
  expect(semFoto.status()).toBe(400)
  expect((await semFoto.json()).erro).toContain("foto da parede")

  const corpo = { tipo: "estampa", produto: "Delicado", cor: "Azul", observacao: "teste", amostra: PNG_MINIMO }
  for (let i = 1; i <= 6; i++) {
    const r = await request.post("/api/simular", { data: corpo })
    expect(r.status()).toBe(200)
    const dados = await r.json()
    expect(dados.demonstracao).toBe(true)
    expect(dados.restantes).toBe(6 - i)
  }
  const bloqueada = await request.post("/api/simular", { data: corpo })
  expect(bloqueada.status()).toBe(429)
})
