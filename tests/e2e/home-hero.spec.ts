import { expect, test, type Locator, type Page } from "@playwright/test"
import { botoesGrandes, ehMobile, esperarHidratacao, limparDados, screenshot, semElementoCortado, semRolagemHorizontal } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

const hero = (page: Page) => page.locator("[data-slot=hero]")
const slideAtivo = (page: Page) => hero(page).locator("[data-slot=carousel-item][data-ativo]")
const indicador = (page: Page, n: number) => page.getByRole("button", { name: new RegExp(`^Ir para o slide ${n}:`) })

async function caixa(l: Locator) {
  const b = await l.boundingBox()
  expect(b, "elemento sem caixa").not.toBeNull()
  return b!
}

function seCruzam(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

/** Arrasta com o dedo (eventos de toque reais) da direita para a esquerda */
async function deslizar(page: Page, y: number) {
  const cdp = await page.context().newCDPSession(page)
  const largura = page.viewportSize()!.width
  const pontos = Array.from({ length: 12 }, (_, i) => Math.round(largura - 40 - ((largura - 100) * i) / 11))
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pontos[0], y }] })
  for (const x of pontos.slice(1)) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] })
    await page.waitForTimeout(24)
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
}

test("carrossel: 5 slides legíveis, sem sobreposição, swipe e pausa", async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  await page.goto("/")
  await esperarHidratacao(page)

  await expect(hero(page)).toHaveAttribute("aria-roledescription", "carrossel")
  for (let i = 1; i <= 5; i++) await expect(page.getByRole("group", { name: `Slide ${i} de 5` })).toHaveCount(1)
  await expect(page.locator("[data-slot=hero-foto]").first()).toHaveAttribute("fetchpriority", "high")

  // Altura: celular ~78vh (máx. 640), desktop ~70vh (máx. 680)
  const { height: alturaHero } = await caixa(hero(page).locator("[data-slot=carousel]"))
  const alturaTela = page.viewportSize()!.height
  if (ehMobile(testInfo)) expect(alturaHero).toBeCloseTo(Math.max(540, Math.min(alturaTela * 0.78, 640)), 0)
  else expect(alturaHero).toBeCloseTo(Math.max(480, Math.min(alturaTela * 0.7, 680)), 0)

  // Pausa pelo teclado
  const pausa = page.getByRole("button", { name: "Pausar a troca automática dos destaques" })
  await pausa.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("button", { name: "Retomar a troca automática dos destaques" })).toBeVisible()

  const whatsapp = page.locator("[data-slot=whatsapp-flutuante]")
  for (let n = 1; n <= 5; n++) {
    await indicador(page, n).click()
    await expect(slideAtivo(page)).toHaveAttribute("aria-label", `Slide ${n} de 5`)
    await expect(indicador(page, n)).toHaveAttribute("aria-current", "true")
    await page.waitForTimeout(1300) // crossfade + entrada do texto

    const titulo = slideAtivo(page).getByRole("heading", { level: 2 })
    await expect(titulo).toBeInViewport({ ratio: 1 })
    const botao = slideAtivo(page).getByRole("link")
    await expect(botao).toBeInViewport({ ratio: 1 })

    const bloco = await caixa(titulo.locator(".."))
    const indicadores = await caixa(page.locator("[data-slot=hero-indicadores]"))
    expect(seCruzam(bloco, indicadores), `slide ${n}: texto cobre os indicadores`).toBe(false)
    expect(bloco.x).toBeGreaterThanOrEqual(0)
    expect(bloco.x + bloco.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    if (await whatsapp.isVisible()) {
      const zap = await caixa(whatsapp)
      expect(seCruzam(bloco, zap), `slide ${n}: WhatsApp cobre o texto`).toBe(false)
      expect(seCruzam(indicadores, zap), `slide ${n}: WhatsApp cobre os indicadores`).toBe(false)
    }

    await screenshot(page, testInfo, `hero-slide-${n}`, false)
  }

  await semRolagemHorizontal(page)
  await semElementoCortado(page)
  await botoesGrandes(page, "[data-slot=hero]")

  if (ehMobile(testInfo)) {
    // Swipe com o dedo: do 5 volta ao 1 (loop)
    const meio = (await caixa(hero(page))).y + 200
    await deslizar(page, meio)
    await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 1 de 5")
    await deslizar(page, meio)
    await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 2 de 5")
  } else {
    await expect(page.getByRole("button", { name: "Próximo destaque" })).toBeVisible()
    await page.getByRole("button", { name: "Próximo destaque" }).click()
    await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 1 de 5")
  }

  // Pausado pela pessoa: não troca sozinho
  const antes = await slideAtivo(page).getAttribute("aria-label")
  await page.waitForTimeout(6800)
  await expect(slideAtivo(page)).toHaveAttribute("aria-label", antes!)
})

test("carrossel troca sozinho a cada 6 s com barra de progresso", async ({ page }, testInfo) => {
  await page.goto("/")
  await esperarHidratacao(page)
  if (!ehMobile(testInfo)) await page.mouse.move(5, 5) // mouse fora do carrossel
  await expect(page.locator("[data-slot=hero-progresso].hero-progresso")).toHaveCount(1)
  // O carregamento pode levar mais de 6 s: compara com o slide da vez, não com o primeiro
  const numero = async () => Number((await slideAtivo(page).getAttribute("aria-label"))!.match(/\d/)![0])
  const inicio = await numero()
  const seguinte = (inicio % 5) + 1
  await expect(slideAtivo(page)).toHaveAttribute("aria-label", `Slide ${seguinte} de 5`, { timeout: 8000 })

  if (!ehMobile(testInfo)) {
    // Hover pausa
    await hero(page).hover()
    await expect(page.locator("[data-slot=hero-progresso].hero-progresso")).toHaveCount(0)
    await page.waitForTimeout(6800)
    await expect(slideAtivo(page)).toHaveAttribute("aria-label", `Slide ${seguinte} de 5`)
  }
})

test("menos movimento: sem autoplay, sem Ken Burns e troca instantânea", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await esperarHidratacao(page)
  await expect(page.locator("[data-slot=hero-pausa]")).toHaveCount(0)
  const animacao = await page.locator("[data-slot=hero-foto]").first().evaluate((el) => getComputedStyle(el).animationName)
  expect(animacao).toBe("none")
  await page.waitForTimeout(6800)
  await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 1 de 5")
  await indicador(page, 3).click()
  await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 3 de 5")
  await expect(slideAtivo(page)).toHaveCSS("opacity", "1")
})

test("slide 4 leva até a seção do adesivo lavável", async ({ page }, testInfo) => {
  await page.goto("/")
  await esperarHidratacao(page)
  await page.getByRole("button", { name: "Pausar a troca automática dos destaques" }).click()
  await indicador(page, 4).click()
  await expect(slideAtivo(page)).toHaveAttribute("aria-label", "Slide 4 de 5")
  await page.waitForTimeout(1000)
  await slideAtivo(page).getByRole("link", { name: "Conhecer o adesivo" }).click()

  const secao = page.locator("#adesivo-lavavel")
  await expect(page).toHaveURL(/#adesivo-lavavel$/)
  await expect(secao.getByRole("heading", { level: 2, name: "Papel adesivo lavável" })).toBeInViewport()
  await expect(secao).toBeFocused()

  await expect(secao.getByText("Bonito e prático para o dia a dia.")).toBeVisible()
  const itens = secao.locator("[data-revelar-item]")
  await expect(itens).toHaveCount(4)
  for (const t of ["Pode ser lavado", "Limpeza com pano úmido", "Vai no banheiro", "Também no teto"]) {
    await expect(secao.getByRole("heading", { level: 3, name: t })).toBeVisible()
  }
  await itens.last().scrollIntoViewIfNeeded()
  await expect(itens.last()).toHaveCSS("opacity", "1")
  const link = secao.getByRole("link", { name: "Ver estampas em adesivo" })
  await expect(link).toHaveAttribute("href", "/produtos?material=adesivo-liso")

  // Celular: lista vertical (um item por linha)
  if (ehMobile(testInfo)) {
    const [a, b] = [await caixa(itens.nth(0)), await caixa(itens.nth(1))]
    expect(b.y).toBeGreaterThanOrEqual(a.y + a.height - 1)
  }

  await semRolagemHorizontal(page)
  await semElementoCortado(page)
  await botoesGrandes(page, "#adesivo-lavavel")
  // Cabeçalho fixo atrapalha o print por elemento
  await page.addStyleTag({ content: "[data-slot=site-header]{position:static!important}" })
  await secao.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  await secao.screenshot({ path: `tests/screenshots/home-adesivo-${testInfo.project.name}.png` })
})
