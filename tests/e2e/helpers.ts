import { expect, type Page, type TestInfo } from "@playwright/test"

export function ehMobile(testInfo: TestInfo): boolean {
  return testInfo.project.name.startsWith("mobile")
}

/** Começa cada teste com o navegador "limpo" (sem dados do store persistido). */
export async function limparDados(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("teste-iniciado")) {
      localStorage.clear()
      sessionStorage.setItem("teste-iniciado", "1")
    }
  })
}

export async function esperarHidratacao(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {})
}

/** Página não pode rolar para o lado. */
export async function semRolagemHorizontal(page: Page) {
  const { scrollWidth, larguraTela } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    larguraTela: window.innerWidth,
  }))
  expect(scrollWidth, "a página não pode ter rolagem horizontal").toBeLessThanOrEqual(larguraTela)
}

/**
 * Nenhum elemento visível pode sair da tela pela lateral
 * (exceto dentro de áreas com rolagem/recorte próprios, como carrosséis).
 */
export async function semElementoCortado(page: Page) {
  const cortados = await page.evaluate(() => {
    const largura = window.innerWidth
    const problemas: string[] = []
    const dentroDeRecorte = (el: Element) => {
      let p = el.parentElement
      while (p && p !== document.body) {
        const ox = getComputedStyle(p).overflowX
        if (ox !== "visible") return true
        p = p.parentElement
      }
      return false
    }
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      if (el.closest("[aria-hidden=true], .sr-only, svg, iframe")) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const estilo = getComputedStyle(el)
      if (estilo.visibility === "hidden" || estilo.position === "fixed") continue
      if ((r.right > largura + 1 || r.left < -1) && !dentroDeRecorte(el)) {
        problemas.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} (${Math.round(r.left)}→${Math.round(r.right)})`)
      }
    }
    return problemas.slice(0, 10)
  })
  expect(cortados, "elementos saindo da tela").toEqual([])
}

/** Botões e links com cara de botão precisam ter pelo menos 48px de altura. */
export async function botoesGrandes(page: Page, escopo = "body") {
  const pequenos = await page.evaluate((seletorEscopo) => {
    const raiz = document.querySelector(seletorEscopo) ?? document.body
    const alvos = raiz.querySelectorAll(
      "button, [role=button], [role=tab], [data-slot=button], [data-slot=whatsapp-link], header a, nav a, input[type=checkbox], input[type=radio]",
    )
    const problemas: string[] = []
    for (const el of Array.from(alvos)) {
      if (el.closest("[aria-hidden=true], .sr-only, [data-teste-ignorar-tamanho]")) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (getComputedStyle(el).visibility === "hidden") continue
      if (r.height < 47.5) {
        const texto = (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)
        problemas.push(`${el.tagName.toLowerCase()} "${texto}" = ${Math.round(r.height)}px`)
      }
    }
    return problemas
  }, escopo)
  expect(pequenos, "botões menores que 48px").toEqual([])
}

export async function verificarLayout(page: Page) {
  await semRolagemHorizontal(page)
  await semElementoCortado(page)
  await botoesGrandes(page)
}

export async function screenshot(page: Page, testInfo: TestInfo, nome: string, fullPage = true) {
  await page.screenshot({
    path: `tests/screenshots/${nome}-${testInfo.project.name}.png`,
    fullPage,
  })
}
