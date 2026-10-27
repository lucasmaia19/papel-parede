import { expect, test, type Page } from "@playwright/test"
import { ehMobile, esperarHidratacao, limparDados, screenshot, semElementoCortado, semRolagemHorizontal, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

const cards = (page: Page) => page.locator("main [data-slot=produto-card]").filter({ visible: true })
const blocos = (page: Page) => page.locator("main [data-slot=bloco-ambiente]").filter({ visible: true })
const etiquetas = (page: Page) => page.locator("main [data-slot=etiqueta-filtro]").filter({ visible: true })
const perguntasAbertas = (page: Page) => page.locator("main [data-slot=perguntas-ambiente][data-aberto]").filter({ visible: true })

async function nomesDosCards(page: Page) {
  return (await cards(page).locator("h2, h3").allInnerTexts()).sort()
}

test("home: “Para qual ambiente?” leva ao catálogo filtrado", async ({ page }, testInfo) => {
  await page.goto("/")
  await esperarHidratacao(page)
  const grade = page.locator("[data-slot=grade-ambientes]")
  await expect(grade.getByRole("link")).toHaveCount(10)
  await expect(grade).toContainText("Combina com o papel adesivo lavável")
  if (ehMobile(testInfo)) {
    // 2 colunas no celular
    const [a, b, c] = await grade.getByRole("link").evaluateAll((els) => els.slice(0, 3).map((e) => e.getBoundingClientRect().top))
    expect(a).toBe(b)
    expect(c).toBeGreaterThan(a)
  }
  await grade.scrollIntoViewIfNeeded()
  await screenshot(page, testInfo, "ambientes-home", false)
  await grade.getByRole("link", { name: /^Quarto/ }).click()
  await expect(page).toHaveURL(/\/produtos\?ambiente=quarto$/)
  await expect(blocos(page).filter({ hasText: "Quarto" })).toHaveAttribute("aria-pressed", "true")
})

test("catálogo: Quarto → Infantil → Menina, etiquetas, URL e voltar", async ({ page }, testInfo) => {
  await page.goto("/produtos")
  await esperarHidratacao(page)
  await expect(page.getByRole("heading", { name: "Para qual ambiente?" })).toBeVisible()
  await expect(blocos(page)).toHaveCount(10)
  await expect(perguntasAbertas(page)).toHaveCount(0)
  await verificarLayout(page)

  // Só o carrossel de ambientes rola para o lado no celular
  if (ehMobile(testInfo)) {
    const rola = await page.locator("[data-slot=blocos-ambientes]").evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(rola).toBe(true)
  }

  await blocos(page).filter({ hasText: "Quarto" }).click()
  await expect(page).toHaveURL(/\?ambiente=quarto$/)
  await expect(perguntasAbertas(page)).toHaveCount(1)
  await expect(page.getByRole("group", { name: "Para qual idade?" })).toBeVisible()
  await expect(page.getByRole("group", { name: "Para quem?" })).toBeVisible()
  const noQuarto = await cards(page).count()
  expect(noQuarto).toBe(9)
  await expect(page.locator("[data-slot=contador]")).toHaveText("9 papéis encontrados")

  await page.getByRole("button", { name: "Infantil", exact: true }).click()
  await expect(page).toHaveURL(/ambiente=quarto&idade=infantil$/)
  await expect(cards(page)).toHaveCount(2)
  await page.getByRole("button", { name: "Menina", exact: true }).click()
  await expect(page).toHaveURL(/ambiente=quarto&idade=infantil&para-quem=menina$/)
  await expect(page.locator("[data-slot=contador]")).toHaveText("2 papéis encontrados")
  expect(await nomesDosCards(page)).toEqual(["Laços e Flores", "Xadrez Aquarela"])
  // O xadrez é Neutro: entra com o selo
  await expect(cards(page).filter({ hasText: "Xadrez Aquarela" }).locator("[data-slot=selo-card]")).toHaveText("Combina com todos")
  await expect(cards(page).filter({ hasText: "Laços e Flores" }).locator("[data-slot=selo-card]")).toHaveCount(0)

  await expect(etiquetas(page)).toHaveText(["Quarto(remover filtro)", "Infantil(remover filtro)", "Menina(remover filtro)"])
  await verificarLayout(page)
  await screenshot(page, testInfo, "ambientes-catalogo-quarto", false)
  await screenshot(page, testInfo, "ambientes-catalogo-quarto-inteiro")

  // A ordem não muda ao tocar de novo nos mesmos filtros
  const ordem = await cards(page).locator("h2").allInnerTexts()
  await page.getByRole("button", { name: "Menina", exact: true }).click()
  await page.getByRole("button", { name: "Menina", exact: true }).click()
  await expect(cards(page)).toHaveCount(2)
  expect(await cards(page).locator("h2").allInnerTexts()).toEqual(ordem)

  // Remover a etiqueta "Infantil" atualiza na hora
  await etiquetas(page).filter({ hasText: "Infantil" }).click()
  await expect(page).toHaveURL(/ambiente=quarto&para-quem=menina$/)
  await expect(etiquetas(page)).toHaveCount(2)
  const comMenina = await cards(page).count()
  expect(comMenina).toBeGreaterThan(2)

  // Voltar do produto mantém o filtro
  await cards(page).first().getByRole("link").click()
  await expect(page).toHaveURL(/\/produtos\/[a-z-0-9]+$/)
  await page.goBack()
  await expect(page).toHaveURL(/ambiente=quarto&para-quem=menina$/)
  await expect(cards(page)).toHaveCount(comMenina)
  await expect(page.getByRole("button", { name: "Menina", exact: true })).toHaveAttribute("aria-pressed", "true")

  // Tirar o ambiente fecha as perguntas e volta tudo
  await etiquetas(page).filter({ hasText: "Quarto" }).click()
  await expect(page).toHaveURL(/\/produtos$/)
  await expect(perguntasAbertas(page)).toHaveCount(0)
  await expect(cards(page)).toHaveCount(13)
})

test("catálogo: link compartilhado abre com o filtro e combina com os outros filtros", async ({ page }, testInfo) => {
  await page.goto("/produtos?ambiente=banheiro&material=adesivo")
  await esperarHidratacao(page)
  await expect(page.getByText("Combina com o papel adesivo lavável")).toBeVisible()
  expect(await nomesDosCards(page)).toEqual(["Azulejos Cozinha", "Cimento Queimado Areia", "Ramos e Laços", "Xadrez 3 cm"])
  await expect(etiquetas(page)).toHaveText(["Banheiro e lavabo(remover filtro)", "Adesivo liso(remover filtro)"])

  if (ehMobile(testInfo)) {
    // Ambiente fica visível no topo; o resto vai na gaveta
    await page.getByRole("button", { name: "Mais filtros (1)" }).click()
    const gaveta = page.getByRole("dialog", { name: "Mais filtros" })
    await gaveta.getByRole("button", { name: "Florais" }).click()
    await expect(gaveta.getByRole("button", { name: "Ver 1 papel" })).toBeVisible()
    await gaveta.getByRole("button", { name: "Ver 1 papel" }).click()
  } else {
    await page.getByRole("complementary", { name: "Mais filtros" }).getByRole("button", { name: "Florais" }).click()
  }
  await expect(page).toHaveURL(/ambiente=banheiro&categoria=floral&material=adesivo$/)
  expect(await nomesDosCards(page)).toEqual(["Ramos e Laços"])
})

test("catálogo: combinação sem resultado mostra sugestões e WhatsApp", async ({ page }, testInfo) => {
  await page.goto("/produtos?ambiente=teto&categoria=floral")
  await esperarHidratacao(page)
  // O bloco escolhido aparece no carrossel mesmo sendo um dos últimos
  const teto = blocos(page).filter({ hasText: "Teto" })
  await expect(teto).toHaveAttribute("aria-pressed", "true")
  await expect
    .poll(() => teto.evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth }))
    .toBe(true)
  const vazio = page.locator("[data-slot=sem-resultado]")
  await expect(vazio).toContainText("Ainda não temos papéis cadastrados para essa combinação.")
  await expect(page.locator("[data-slot=contador]")).toHaveText("0 papéis encontrados")
  const whatsapp = vazio.getByRole("link", { name: "Pedir um papel personalizado no WhatsApp" })
  const href = decodeURIComponent((await whatsapp.getAttribute("href")) ?? "")
  expect(href).toContain("https://wa.me/5534996804044?text=")
  expect(href).toContain("O que procuro: Teto, estampa: Florais.")
  await expect(whatsapp).toHaveAttribute("target", "_blank")
  await expect(page.getByRole("heading", { name: "Outros papéis para Teto" })).toBeVisible()
  await expect(cards(page).filter({ hasText: "Madeira Fria" })).toHaveCount(1)
  await verificarLayout(page)
  await screenshot(page, testInfo, "ambientes-sem-resultado", false)

  await vazio.getByRole("button", { name: "Limpar filtros" }).click()
  await expect(cards(page)).toHaveCount(13)
})

test("produto: “Indicado para” leva ao catálogo e o ambiente vai para o WhatsApp", async ({ page }, testInfo) => {
  await page.goto("/produtos?ambiente=quarto&idade=infantil&para-quem=menina")
  await esperarHidratacao(page)
  await cards(page).filter({ hasText: "Laços e Flores" }).getByRole("link").click()
  await expect(page).toHaveURL(/\/produtos\/lacos-e-flores$/)
  const indicado = page.locator("[data-slot=indicado-para]")
  await expect(indicado).toHaveText("Indicado para: Quarto (Infantil, Menina) • Brinquedoteca")
  await semRolagemHorizontal(page)
  await semElementoCortado(page)

  const duvida = page.locator("main a[data-slot=whatsapp-link]").filter({ visible: true }).first()
  const texto = decodeURIComponent((await duvida.getAttribute("href")) ?? "")
  expect(texto).toContain("Ambiente: Quarto (Infantil • Menina)")
  await indicado.scrollIntoViewIfNeeded()
  await screenshot(page, testInfo, "ambientes-produto", false)

  await indicado.getByRole("link", { name: "Brinquedoteca" }).click()
  await expect(page).toHaveURL(/\/produtos\?ambiente=brinquedoteca$/)
  await expect(cards(page).filter({ hasText: "Laços e Flores" })).toHaveCount(1)
})

test("admin: ambientes — criar, editar perguntas, desativar e excluir com aviso", async ({ page }, testInfo) => {
  await page.goto("/admin")
  await esperarHidratacao(page)
  await page.locator("main").getByRole("link", { name: /Ambientes/ }).click()
  await expect(page).toHaveURL(/\/admin\/ambientes$/)
  const itens = page.locator("[data-slot=ambiente-admin]").filter({ visible: true })
  await expect(itens).toHaveCount(10)
  await expect(itens.first()).toContainText("Quarto")
  await expect(itens.first()).toContainText("9 papéis")
  await verificarLayout(page)
  await screenshot(page, testInfo, "ambientes-admin")

  // Novo ambiente com uma pergunta (validação primeiro)
  await page.getByRole("button", { name: "Novo ambiente" }).click()
  const dialogo = page.getByRole("dialog", { name: "Novo ambiente" })
  await dialogo.getByRole("button", { name: "Adicionar pergunta" }).click()
  await dialogo.getByRole("button", { name: "Cadastrar ambiente" }).click()
  await expect(dialogo.getByText("Digite o nome do ambiente. Exemplo: Quarto.")).toBeVisible()
  await expect(dialogo.getByText("Digite a pergunta. Exemplo: Para qual idade?")).toBeVisible()
  await dialogo.getByRole("textbox", { name: "Nome do ambiente" }).fill("Varanda")
  await dialogo.getByRole("textbox", { name: "Pergunta 1" }).fill("Qual clima?")
  await dialogo.getByRole("textbox", { name: "Opção 1" }).fill("Aberta")
  await dialogo.getByRole("button", { name: "Adicionar opção à pergunta Qual clima?" }).click()
  await dialogo.getByRole("textbox", { name: "Opção 2" }).fill("Fechada")
  await dialogo.getByRole("button", { name: "Cadastrar ambiente" }).click()
  await expect(dialogo).toBeHidden()
  await expect(itens).toHaveCount(11)
  await expect(itens.last()).toContainText("Varanda")
  await expect(itens.last()).toContainText("Sem papel: não aparece")

  // Subir: Varanda troca de lugar com Comercial
  await page.getByRole("button", { name: "Subir Varanda" }).click()
  await expect(itens.nth(9)).toContainText("Varanda")

  // Marcar Varanda num papel e ver na loja com a pergunta
  await page.goto("/admin/produtos/p10")
  const ondeUsar = page.getByRole("region", { name: "Onde usar este papel" })
  await ondeUsar.getByRole("checkbox", { name: "Varanda" }).check()
  await ondeUsar.getByRole("checkbox", { name: "Aberta" }).check()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.getByText("Alterações salvas. Já aparecem na loja.")).toBeVisible()
  await page.goto("/produtos?ambiente=varanda&clima=aberta")
  await expect(blocos(page)).toHaveCount(11)
  await expect(page.getByRole("button", { name: "Aberta", exact: true })).toHaveAttribute("aria-pressed", "true")
  // "Fechada" não tem papel: não aparece
  await expect(page.getByRole("button", { name: "Fechada", exact: true })).toHaveCount(0)
  expect(await nomesDosCards(page)).toEqual(["Madeira Fria"])

  // Excluir uma opção em uso avisa quantos papéis usam
  await page.goto("/admin/ambientes")
  await page.getByRole("button", { name: "Editar Varanda" }).click()
  const editar = page.getByRole("dialog", { name: "Editar: Varanda" })
  await editar.getByRole("button", { name: "Excluir opção Aberta" }).click()
  const alerta = page.getByRole("alertdialog")
  await expect(alerta).toContainText("1 papel usa esta opção.")
  await alerta.getByRole("button", { name: "Sim, excluir" }).click()
  await expect(editar.getByRole("textbox", { name: "Opção 1" })).toHaveValue("Fechada")
  await editar.getByRole("button", { name: "Salvar ambiente" }).click()
  await expect(editar).toBeHidden()

  // Desativar some da loja
  await page.getByRole("button", { name: "Desativar Teto" }).click()
  await page.goto("/produtos")
  await expect(blocos(page).filter({ hasText: "Teto" })).toHaveCount(0)

  // Excluir ambiente em uso: aviso com a quantidade e a referência sai dos papéis
  await page.goto("/admin/ambientes")
  await page.getByRole("button", { name: "Excluir Brinquedoteca" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("3 papéis usam este ambiente.")
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, excluir" }).click()
  await expect(itens).toHaveCount(10)
  await page.goto("/produtos/lacos-e-flores")
  await expect(page.locator("[data-slot=indicado-para]")).toHaveText("Indicado para: Quarto (Infantil, Menina)")
})

test("admin: lista de papéis mostra ambientes e destaca os sem ambiente", async ({ page }, testInfo) => {
  await page.goto("/admin/produtos")
  await esperarHidratacao(page)
  const itens = page.locator("[data-slot=produto-admin]").filter({ visible: true })
  await expect(itens.filter({ hasText: "Laços e Flores" }).locator("[data-slot=ambientes-admin]")).toHaveText("Ambientes: Quarto · Brinquedoteca")
  await page.getByLabel("Ambiente").selectOption({ label: "Teto" })
  await expect(itens).toHaveCount(1)
  await expect(itens.first()).toContainText("Madeira Fria")

  // Um papel duplicado e sem ambiente aparece destacado
  await page.getByLabel("Ambiente").selectOption({ label: "Todos os ambientes" })
  await page.goto("/admin/ambientes")
  await page.getByRole("button", { name: "Excluir Escritório / Home office" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, excluir" }).click()
  await page.getByRole("button", { name: "Excluir Sala de estar" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, excluir" }).click()
  await page.goto("/admin/produtos")
  await expect(page.getByRole("note").filter({ hasText: "sem ambiente" })).toContainText("1 papel está sem ambiente")
  await page.getByRole("button", { name: "Ver quais" }).click()
  await expect(itens).toHaveCount(1)
  await expect(itens.first()).toContainText("Madeira Louro Freijó")
  await expect(itens.first().getByText("Sem ambiente")).toBeVisible()
  await verificarLayout(page)
  await screenshot(page, testInfo, "ambientes-admin-produtos", false)
})
