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
      // Rádio/checkbox dentro de <label>: a área de toque é o label inteiro
      const alvo = (el.matches("input") && el.closest("label")) || el
      const r = alvo.getBoundingClientRect()
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

/**
 * Cada botão de `escopo`, quando rolado para a tela, não pode ficar coberto
 * (pela barra de preço fixa, pelo WhatsApp flutuante ou pelo cabeçalho).
 */
export async function nadaCobreBotoes(page: Page, escopo = "main") {
  const cobertos = await page.evaluate(async (seletor) => {
    const raiz = document.querySelector(seletor) ?? document.body
    const alvos = Array.from(raiz.querySelectorAll("button, a[data-slot=whatsapp-link], a[class*=min-h-1]")) as HTMLElement[]
    const problemas: string[] = []
    for (const el of alvos) {
      const r0 = el.getBoundingClientRect()
      if (r0.width === 0 || r0.height === 0 || el.closest("[role=dialog]")) continue
      el.scrollIntoView({ block: "nearest", inline: "nearest" })
      await new Promise((r) => requestAnimationFrame(() => r(null)))
      const r = el.getBoundingClientRect()
      const pontos = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + 6, r.bottom - 4],
        [r.right - 6, r.bottom - 4],
      ]
      for (const [x, y] of pontos) {
        const topo = document.elementFromPoint(x, y)
        if (topo && topo !== el && !el.contains(topo)) {
          const quem = topo.closest("[data-slot]")?.getAttribute("data-slot") ?? topo.tagName
          problemas.push(`"${(el.textContent ?? "").trim().slice(0, 30)}" coberto por ${quem}`)
          break
        }
      }
    }
    return problemas
  }, escopo)
  expect(cobertos, "botões cobertos por elementos fixos").toEqual([])
}

/**
 * O WhatsApp flutuante não pode ficar por cima de nada clicável (botões, links, campos, miniaturas).
 * Confere a interseção dos retângulos com a página no topo e com cada elemento rolado até a tela
 * (como acontece ao tocar/usar o teclado: o scroll-padding reserva o espaço do botão).
 */
export async function whatsappNaoSobrepoe(page: Page) {
  const sobrepostos = await page.evaluate(async () => {
    const botao = document.querySelector("[data-slot=whatsapp-flutuante]")
    if (!botao || botao.getBoundingClientRect().width === 0) return ["botão flutuante não encontrado"]
    const seletor = "a[href], button, input, select, textarea, [role=button], [role=tab], [tabindex]:not([tabindex='-1'])"
    const alvos = (Array.from(document.querySelectorAll(seletor)) as HTMLElement[]).filter(
      (el) =>
        el !== botao &&
        !botao.contains(el) &&
        !el.closest("[role=dialog], [aria-hidden=true], .sr-only, [inert]") &&
        getComputedStyle(el).visibility !== "hidden" &&
        el.getBoundingClientRect().width > 0 &&
        // campos escondidos de arquivo/range ocupam a área de outro controle
        !(el instanceof HTMLInputElement && ["file", "range"].includes(el.type)),
    )
    const cruza = (a: DOMRect, b: DOMRect) =>
      a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1
    const nome = (el: HTMLElement) =>
      (el.getAttribute("aria-label") || el.textContent || el.getAttribute("placeholder") || el.tagName).trim().slice(0, 40)
    const problemas = new Set<string>()
    const esperar = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))

    window.scrollTo(0, 0)
    await esperar()
    for (const el of alvos) {
      if (cruza(el.getBoundingClientRect(), botao.getBoundingClientRect())) problemas.add(`no topo: "${nome(el)}"`)
    }
    for (const el of alvos) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" })
      await esperar()
      if (cruza(el.getBoundingClientRect(), botao.getBoundingClientRect())) problemas.add(`rolando até: "${nome(el)}"`)
    }
    window.scrollTo(0, 0)
    return [...problemas].slice(0, 15)
  })
  expect(sobrepostos, "elementos clicáveis embaixo do WhatsApp flutuante").toEqual([])
}

export async function verificarLayout(page: Page) {
  await semRolagemHorizontal(page)
  await semElementoCortado(page)
  await botoesGrandes(page)
}

/** Rola a página até o fim para carregar imagens "lazy" e volta ao topo. */
export async function carregarImagens(page: Page) {
  await page.evaluate(async () => {
    const passo = window.innerHeight * 0.8
    for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 5000 }).catch(() => {})
}

export async function screenshot(page: Page, testInfo: TestInfo, nome: string, fullPage = true) {
  if (fullPage) await carregarImagens(page)
  await page.screenshot({
    path: `tests/screenshots/${nome}-${testInfo.project.name}.png`,
    fullPage,
  })
}
