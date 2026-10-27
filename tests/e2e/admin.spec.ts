import { expect, test, type Page } from "@playwright/test"
import { esperarHidratacao, limparDados, screenshot, verificarLayout } from "./helpers"

test.beforeEach(async ({ page }) => {
  await limparDados(page)
})

const visiveis = (page: Page, seletor: string) => page.locator(seletor).filter({ visible: true })

test("painel: aviso, números, atalhos e restaurar dados", async ({ page }, testInfo) => {
  await page.goto("/admin")
  await esperarHidratacao(page)
  await expect(page.locator("[data-slot=aviso-admin]")).toContainText(
    "Área administrativa — no sistema final esta tela será acessível apenas pelo administrador, com login. Nesta versão de protótipo ela está aberta.",
  )
  await expect(page.locator("[data-slot=numero-painel]").first()).toContainText("13")
  for (const atalho of ["Papéis de parede", "Trabalhos realizados", "Configurações", "Pedidos"]) {
    await expect(page.locator("main").getByRole("link", { name: new RegExp(atalho) }).first()).toBeVisible()
  }
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase7-painel")

  await page.getByRole("button", { name: "Restaurar dados de exemplo" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, restaurar" }).click()
  await expect(page.getByText("Dados de exemplo restaurados.")).toBeVisible()
})

test("produtos: buscar, desativar, duplicar e excluir", async ({ page }, testInfo) => {
  await page.goto("/admin/produtos")
  await esperarHidratacao(page)
  await expect(visiveis(page, "[data-slot=produto-admin]")).toHaveCount(13)
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase7-produtos")

  await page.getByRole("searchbox", { name: "Buscar papel de parede" }).fill("toile")
  await expect(visiveis(page, "[data-slot=produto-admin]")).toHaveCount(1)
  await page.getByRole("button", { name: "Desativar Toile de Jouy" }).click()
  await expect(visiveis(page, "[data-slot=produto-admin]").first()).toContainText("Desativado")

  // Some da loja
  await page.goto("/produtos")
  await expect(visiveis(page, "main [data-slot=produto-card]")).toHaveCount(12)

  await page.goto("/admin/produtos")
  await page.getByRole("button", { name: "Duplicar Xadrez 3 cm" }).click()
  await expect(page).toHaveURL(/\/admin\/produtos\/p.+/)
  await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue("Xadrez 3 cm (cópia)")

  await page.goto("/admin/produtos")
  await expect(visiveis(page, "[data-slot=produto-admin]")).toHaveCount(14)
  await page.getByRole("button", { name: "Excluir Xadrez 3 cm (cópia)" }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: "Sim, excluir" }).click()
  await expect(visiveis(page, "[data-slot=produto-admin]")).toHaveCount(13)
})

test("cadastro de produto completo aparece na loja", async ({ page }, testInfo) => {
  await page.goto("/admin/produtos/novo")
  await esperarHidratacao(page)

  // Validação
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.locator("[data-slot=resumo-erros]")).toContainText("Falta corrigir")
  await expect(page.getByText("Envie pelo menos uma foto.")).toBeVisible()
  await expect(page.getByText("Marque pelo menos um ambiente onde este papel pode ser usado.")).toBeVisible()

  await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Linho Natural")
  await expect(page.getByText("Fica assim: /produtos/linho-natural")).toBeVisible()
  await page.getByLabel("Estilo (categoria)").selectOption("texturizado")

  // Onde usar: Quarto exige uma opção em cada pergunta; Banheiro e Teto não têm perguntas
  const ondeUsar = page.getByRole("region", { name: "Onde usar este papel" })
  await ondeUsar.getByRole("checkbox", { name: "Quarto" }).check()
  await ondeUsar.getByRole("checkbox", { name: "Infantil" }).check()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(ondeUsar.getByText("Quarto: marque pelo menos uma opção em “Para quem?”.")).toBeVisible()
  await ondeUsar.getByRole("checkbox", { name: "Quarto" }).uncheck()
  await ondeUsar.getByRole("checkbox", { name: "Banheiro e lavabo" }).check()
  await ondeUsar.getByRole("checkbox", { name: "Teto" }).check()
  await expect(ondeUsar.locator("[data-slot=resumo-ambientes]")).toHaveText("Este papel aparece em: Banheiro e lavabo, Teto")
  // Materiais: cada um com o seu preço
  await expect(visiveis(page, "[data-slot=material-admin]")).toHaveCount(2)
  await page.getByRole("textbox", { name: "Preço por m²" }).nth(0).fill("90,5")
  await page.getByRole("textbox", { name: "Preço por m²" }).nth(1).fill("99")

  // Fotos
  await page.locator("[data-slot=entrada-fotos]").first().setInputFiles([
    "public/img/produtos/xadrez-aquarela.webp",
    "public/img/produtos/cimento-queimado-areia.webp",
  ])
  await expect(visiveis(page, "[data-slot=foto-produto]")).toHaveCount(2)
  await page.getByRole("button", { name: "Descer foto 1" }).click()
  await page.getByRole("button", { name: "Principal : foto 2" }).click()

  // Cor
  await page.getByRole("textbox", { name: "Nome da cor 1" }).fill("Areia")

  // Personalização
  await page.getByRole("button", { name: "Adicionar grupo", exact: true }).click()
  await page.getByRole("textbox", { name: "Nome do grupo 1" }).fill("Tamanho do quadrado")
  await page.getByRole("textbox", { name: "Opção 1" }).fill("5 cm")
  await page.getByRole("textbox", { name: "Acréscimo" }).first().fill("8")
  await page.getByRole("button", { name: "Adicionar opção ao grupo Tamanho do quadrado" }).click()
  await page.getByRole("textbox", { name: "Opção 2" }).fill("10 cm")

  // Régua por dois cliques (a amostra tem 60 cm de largura)
  const foto = page.locator("[data-slot=foto-calibracao]")
  await foto.scrollIntoViewIfNeeded()
  const caixa = (await foto.boundingBox())!
  await foto.click({ position: { x: caixa.width * 0.1, y: caixa.height * 0.5 } })
  await expect(page.getByText("1 ponto marcado")).toBeVisible()
  await foto.click({ position: { x: caixa.width * 0.6, y: caixa.height * 0.5 } })
  await expect(page.getByText(/2 pontos marcados/)).toBeVisible()
  await page.getByRole("textbox", { name: "Distância entre os pontos" }).fill("30")
  await page.getByRole("button", { name: "Calcular" }).click()
  // A escala depende do tamanho da foto enviada: basta ter calibrado
  await expect(page.getByText(/Régua calibrada: [\d,]+ pixels por cm/)).toBeVisible()
  await page.getByRole("button", { name: "Adicionar medida" }).click()
  await page.getByRole("textbox", { name: "Nome da medida 1" }).fill("Cada quadrado")
  await page.locator("[data-slot=medida-admin]").getByRole("textbox", { name: "Largura" }).fill("10")
  await page.locator("[data-slot=medida-admin]").getByRole("textbox", { name: "Altura (opcional)" }).fill("10")
  await expect(page.getByRole("heading", { name: "Como o cliente vê" })).toBeVisible()

  // IA
  await page.getByRole("switch", { name: "Simulação com IA ligada" }).click()
  await page.getByRole("button", { name: "Adicionar sugestão" }).click()
  await page.getByRole("textbox", { name: "Sugestão 1" }).fill("Deixar as linhas mais grossas")

  await verificarLayout(page)
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.getByText("Alterações salvas. Já aparecem na loja.")).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/produtos\/p[a-z0-9]+$/)
  await screenshot(page, testInfo, "fase7-produto-form")

  // Na loja, no catálogo filtrado pelos ambientes marcados
  for (const ambiente of ["banheiro", "teto"]) {
    await page.goto(`/produtos?ambiente=${ambiente}`)
    await esperarHidratacao(page)
    await expect(visiveis(page, "main [data-slot=produto-card]").filter({ hasText: "Linho Natural" })).toHaveCount(1)
  }
  await page.goto("/produtos?ambiente=quarto")
  await expect(visiveis(page, "main [data-slot=produto-card]").first()).toBeVisible()
  await expect(visiveis(page, "main [data-slot=produto-card]").filter({ hasText: "Linho Natural" })).toHaveCount(0)

  await page.goto("/produtos/linho-natural")
  await esperarHidratacao(page)
  await expect(page.getByRole("heading", { level: 1, name: "Linho Natural" })).toBeVisible()
  await expect(page.locator("[data-slot=indicado-para]")).toHaveText("Indicado para: Banheiro e lavabo • Teto")
  await expect(page.locator("[data-slot=preco-m2]")).toContainText("a partir de R$ 90,50")
  // Trocar o material atualiza o total na hora: 2 × 2,5 = 5 m² + 10% = 5,5 m²
  const parede = page.locator("[data-slot=parede]").first()
  await parede.getByRole("textbox", { name: "Largura" }).fill("2")
  await parede.getByRole("textbox", { name: "Altura" }).fill("2,5")
  const totalLoja = page.locator("main [data-slot=resumo-preco]").filter({ visible: true }).first().locator("[data-slot=total]")
  await page.getByRole("button", { name: /^Texturizado linho/ }).click()
  await expect(totalLoja).toHaveText("R$ 497,75")
  await page.getByRole("button", { name: /^Adesivo liso/ }).click()
  await expect(totalLoja).toHaveText("R$ 544,50")
  await expect(page.locator("[data-slot=preco-m2]")).toContainText("R$ 99,00")
  await page.getByRole("button", { name: "Mostrar régua" }).click()
  await expect(page.getByText("Cada quadrado mede 10 cm x 10 cm")).toBeVisible()
  await expect(page.getByRole("button", { name: /5 cm/ })).toBeVisible()
  await expect(page.getByRole("button", { name: "Deixar as linhas mais grossas" })).toBeVisible()
})

test("trabalhos: cadastrar e aparecer na loja", async ({ page }, testInfo) => {
  await page.goto("/admin/trabalhos")
  await esperarHidratacao(page)
  await expect(visiveis(page, "[data-slot=trabalho-admin]")).toHaveCount(1)
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase7-trabalhos")

  await page.getByRole("button", { name: "Novo trabalho" }).click()
  const dialogo = page.getByRole("dialog", { name: "Novo trabalho" })
  await dialogo.getByRole("button", { name: "Salvar trabalho" }).click()
  await expect(dialogo.getByText("Envie a foto de depois.")).toBeVisible()
  await expect(dialogo.getByText("Envie a foto de antes.")).toHaveCount(0)
  await dialogo.getByRole("textbox", { name: "Título" }).fill("Lavabo xadrez")
  await dialogo.getByRole("textbox", { name: "Cidade" }).fill("Monte Carmelo")
  await dialogo.locator("[data-slot=entrada-fotos]").nth(0).setInputFiles("public/img/produtos/cimento-queimado-areia.webp")
  await dialogo.locator("[data-slot=entrada-fotos]").nth(1).setInputFiles("public/img/produtos/xadrez-3cm.webp")
  await dialogo.getByLabel("Papel de parede usado (opcional)").selectOption({ label: "Xadrez 3 cm" })
  await dialogo.getByRole("button", { name: "Salvar trabalho" }).click()
  await expect(dialogo).toBeHidden()
  await expect(visiveis(page, "[data-slot=trabalho-admin]")).toHaveCount(2)
  await page.getByRole("button", { name: "Subir Lavabo xadrez" }).click()
  await expect(visiveis(page, "[data-slot=trabalho-admin]").nth(0)).toContainText("Lavabo xadrez")

  await page.goto("/trabalhos")
  await page.getByRole("button", { name: "Monte Carmelo" }).click()
  await expect(visiveis(page, "[data-slot=trabalho]")).toHaveCount(1)
  await expect(visiveis(page, "[data-slot=trabalho]").first()).toContainText("Lavabo xadrez")
})

test("configurações mudam os preços da loja", async ({ page }, testInfo) => {
  await page.goto("/admin/configuracoes")
  await esperarHidratacao(page)
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase7-configuracoes")

  await page.getByRole("textbox", { name: "WhatsApp (com 55 e DDD)" }).fill("123")
  await page.getByRole("button", { name: "Salvar configurações" }).click()
  await expect(page.getByText(/Digite com 55 \+ DDD/)).toBeVisible()
  await page.getByRole("textbox", { name: "WhatsApp (com 55 e DDD)" }).fill("5534996804044")

  await page.getByRole("textbox", { name: "Aplicação por m²" }).fill("30")
  await page.getByRole("textbox", { name: "Desconto no Pix" }).fill("10")
  await page.getByRole("button", { name: "Salvar configurações" }).click()
  await expect(page.getByText("Configurações salvas. Já valem na loja.")).toBeVisible()

  await page.goto("/produtos/linho-texturizado-off-white")
  await esperarHidratacao(page)
  const parede = page.locator("[data-slot=parede]").first()
  await parede.getByRole("textbox", { name: "Largura" }).fill("2")
  await parede.getByRole("textbox", { name: "Altura" }).fill("2,5")
  await page.getByLabel("Digite seu CEP").filter({ visible: true }).fill("38408610")
  await page.getByRole("button", { name: "Calcular" }).click()
  await expect(page.getByText("R$ 30,00 por m² — R$ 150,00 nesta parede")).toBeVisible()
  await expect(page.getByText(/\(10% de desconto\)/).filter({ visible: true }).first()).toBeVisible()
})

test("pedidos: filtros, status e detalhes", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("pedidos-semeados")) return
    const base = {
      endereco: { cep: "38408-610", rua: "Rua A", numero: "10", bairro: "Centro", cidade: "Uberlândia", uf: "MG" },
      itens: [
        {
          id: "i1",
          produtoId: "p1",
          produtoNome: "Delicado",
          produtoSlug: "delicado",
          imagem: "/img/produtos/delicado.webp",
          cor: { nome: "Azul", hex: "#8FA6D6" },
          material: { id: "adesivo", nome: "Adesivo liso" },
          personalizacoes: [{ grupo: "Tamanho da estampa", opcao: "M", acrescimoM2: 0 }],
          paredes: [{ id: "w", largura: 3, altura: 2.5, aberturas: [] }],
          m2: 8.25,
          m2Parede: 7.5,
          precoM2: 80,
          servicos: { aplicacao: true, visita: false },
          simulacao: { tipo: "estampa", observacao: "Flores em rosa" },
          prontaEntrega: false,
          prazoProducaoDias: 7,
          subtotalPapel: 660,
          subtotalAplicacao: 187.5,
          subtotal: 847.5,
        },
      ],
      modalidade: "aplicacao",
      naRegiao: true,
      frete: 0,
      deslocamento: 0,
      visita: 0,
      prazoEntregaDias: null,
      prazoTexto: "Produção em até 7 dias úteis.",
      descontoPix: 0,
      formaPagamento: "cartao",
      status: "Novo",
      data: "2026-10-20T14:00:00.000Z",
    }
    const pedidos = [
      { ...base, id: "o1", numero: 1001, total: 847.5, canal: "site", cliente: { nome: "Ana Souza", telefone: "(34) 9 9999-8888", email: "" } },
      { ...base, id: "o2", numero: 1002, total: 660, canal: "whatsapp", formaPagamento: "whatsapp", cliente: { nome: "João", telefone: "", email: "" } },
    ]
    localStorage.setItem("rodovalho-loja", JSON.stringify({ state: { pedidos }, version: 1 }))
    sessionStorage.setItem("pedidos-semeados", "1")
  })
  await page.goto("/admin/pedidos")
  await esperarHidratacao(page)
  await expect(visiveis(page, "[data-slot=pedido-admin]")).toHaveCount(2)

  await page.getByRole("button", { name: "WhatsApp", exact: true }).click()
  await expect(visiveis(page, "[data-slot=pedido-admin]")).toHaveCount(1)
  await expect(visiveis(page, "[data-slot=pedido-admin]").first()).toContainText("João")
  await page.getByRole("button", { name: "Site", exact: true }).click()
  const pedido = visiveis(page, "[data-slot=pedido-admin]").first()
  await expect(pedido).toContainText("Ana Souza")
  await expect(pedido.getByRole("link", { name: "Chamar no WhatsApp" })).toHaveAttribute("href", /wa\.me\/5534999998888\?text=/)

  await pedido.getByLabel("Status").selectOption("Em produção")
  await pedido.getByText(/Ver detalhes/).click()
  await expect(pedido).toContainText("Flores em rosa")
  await expect(pedido).toContainText("Material: Adesivo liso")
  await expect(pedido).toContainText("8,25 m²")
  await expect(pedido).toContainText("aplicação")

  await page.getByRole("button", { name: "Todos", exact: true }).nth(1).click()
  await page.getByRole("button", { name: "Em produção" }).click()
  await expect(visiveis(page, "[data-slot=pedido-admin]")).toHaveCount(1)
  await verificarLayout(page)
  await screenshot(page, testInfo, "fase7-pedidos")

  await page.goto("/admin")
  await expect(page.locator("[data-slot=numero-painel]").nth(2)).toContainText("1") // pedidos novos
  await expect(page.locator("[data-slot=numero-painel]").nth(3)).toContainText("1") // via WhatsApp
})
