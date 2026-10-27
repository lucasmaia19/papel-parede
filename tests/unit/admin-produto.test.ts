import { describe, expect, it } from "vitest"
import {
  calcularPixelsPorCm,
  moverItem,
  produtoParaForm,
  produtoVazio,
  slugificar,
  validarProduto,
} from "@/lib/admin-produto"
import { produtosIniciais } from "@/lib/data"

describe("admin — produto", () => {
  it("cria slug sem acentos", () => {
    expect(slugificar("Floral Jardim — Coleção Inverno!")).toBe("floral-jardim-colecao-inverno")
  })

  it("produto de exemplo ida e volta pelo formulário não muda", () => {
    const original = produtosIniciais[2]
    const { produto, erros } = validarProduto(produtoParaForm(original), produtosIniciais)
    expect(erros).toEqual({})
    expect(produto).toEqual(original)
  })

  it("mostra erros claros no produto vazio", () => {
    const { produto, erros } = validarProduto(produtoVazio(80), produtosIniciais)
    expect(produto).toBeNull()
    expect(erros.nome).toBeTruthy()
    expect(erros.imagens).toBe("Envie pelo menos uma foto.")
    expect(erros["cores.0.nome"]).toBe("Digite o nome da cor.")
    expect(erros.precoM2).toBeUndefined() // vem do preço padrão
  })

  it("não deixa repetir o endereço de outro produto", () => {
    const form = { ...produtoVazio(80), nome: "Delicado" }
    expect(validarProduto(form, produtosIniciais).erros.slug).toMatch(/Já existe/)
  })

  it("aceita vírgula no preço e no acréscimo", () => {
    const form = produtoVazio(80)
    form.nome = "Novo Papel"
    form.materiais[0].precoM2 = "92,50"
    form.materiais[1].precoM2 = "99"
    form.imagens = [{ id: "i", url: "/x.svg", alt: "x" }]
    form.cores[0].nome = "Verde"
    form.gruposPersonalizacao = [{ id: "g", nome: "Tamanho", opcoes: [{ id: "o", rotulo: "G", acrescimoM2: "7,5" }] }]
    const { produto, erros } = validarProduto(form, produtosIniciais)
    expect(erros).toEqual({})
    expect(produto?.precoM2).toBe(92.5) // o menor preço entre os materiais ativos
    expect(produto?.materiais.map((m) => m.precoM2)).toEqual([92.5, 99])
    expect(produto?.slug).toBe("novo-papel")
    expect(produto?.gruposPersonalizacao[0].opcoes[0].acrescimoM2).toBe(7.5)
    expect(produto?.regua).toBeNull()
  })

  it("exige um material ativo com nome e preço", () => {
    const form = produtoVazio(80)
    form.materiais[0].ativo = false
    form.materiais[1].ativo = false
    form.materiais[1].precoM2 = "abc"
    form.materiais[0].nome = " "
    const { erros } = validarProduto(form, produtosIniciais)
    expect(erros.materiais).toBe("Deixe pelo menos um material ativo.")
    expect(erros["materiais.0.nome"]).toBeTruthy()
    expect(erros["materiais.1.preco"]).toMatch(/preço por m²/)
  })

  it("calibra a régua por dois cliques", () => {
    expect(calcularPixelsPorCm({ x: 0, y: 0 }, { x: 300, y: 400 }, 25)).toBe(20)
    expect(calcularPixelsPorCm({ x: 0, y: 0 }, { x: 0, y: 0 }, 10)).toBeNull()
    expect(calcularPixelsPorCm({ x: 0, y: 0 }, { x: 10, y: 0 }, 0)).toBeNull()
  })

  it("reordena listas", () => {
    expect(moverItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"])
    expect(moverItem(["a", "b"], 0, -1)).toEqual(["a", "b"])
  })
})

describe("admin — configurações", async () => {
  const { settingsParaForm, validarSettings } = await import("@/lib/admin-settings")
  const { settingsIniciais } = await import("@/lib/data")

  it("ida e volta pelo formulário não muda", () => {
    const { settings, erros } = validarSettings(settingsParaForm(settingsIniciais))
    expect(erros).toEqual({})
    expect(settings).toEqual(settingsIniciais)
  })

  it("valida faixa de CEP, porcentagem e WhatsApp", () => {
    const form = settingsParaForm(settingsIniciais)
    form.cidadesAtendidas[0].faixasCep = [{ inicio: "38499", fim: "38400" }]
    form.descontoPix = "150"
    form.whatsapp = "9999"
    form.freteGratisLigado = false
    const { settings, erros } = validarSettings(form)
    expect(settings).toBeNull()
    expect(erros["cidades.0.faixas.0"]).toMatch(/5 primeiros números/)
    expect(erros.descontoPix).toMatch(/porcentagem/)
    expect(erros.whatsapp).toBeTruthy()
  })

  it("frete grátis desligado vira null", () => {
    const form = settingsParaForm(settingsIniciais)
    form.freteGratisLigado = false
    expect(validarSettings(form).settings?.freteGratisAcimaDe).toBeNull()
  })
})
