import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { esperarHidratacao, limparDados } from "./helpers"

const PAGINAS = [
  "/",
  "/produtos",
  "/pronta-entrega",
  "/produtos/xadrez-vichy",
  "/trabalhos",
  "/contato",
  "/carrinho",
  "/admin",
  "/admin/produtos",
  "/admin/produtos/p3",
  "/admin/trabalhos",
  "/admin/configuracoes",
  "/admin/pedidos",
]

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

for (const caminho of PAGINAS) {
  test(`acessibilidade (axe, WCAG AA): ${caminho}`, async ({ page }, testInfo) => {
    test.skip(!["mobile-390", "desktop-1280"].includes(testInfo.project.name), "uma largura de celular e o desktop bastam")
    await page.goto(caminho)
    await esperarHidratacao(page)
    const resultado = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // O mapa do Google é conteúdo de terceiros (iframe)
      .exclude("iframe")
      .analyze()
    const problemas = resultado.violations.map(
      (v) => `${v.impact} — ${v.id}: ${v.help} (${v.nodes.length}x) → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`,
    )
    expect(problemas, "violações de acessibilidade").toEqual([])
  })
}
