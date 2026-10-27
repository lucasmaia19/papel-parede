import { describe, expect, it } from "vitest"
import {
  alternarOpcao,
  ambientesVisiveis,
  escreverFiltroAmbiente,
  filtrarPorAmbiente,
  indicacoesProduto,
  lerFiltroAmbiente,
  ordenarComSemente,
  produtosQueUsam,
  removerReferencia,
  resumoAmbientes,
  textoFiltroAmbiente,
  type FiltroAmbiente,
} from "@/lib/ambientes"
import { validarProduto, produtoParaForm } from "@/lib/admin-produto"
import { filtrarProdutos } from "@/lib/catalogo"
import { ambientesIniciais, distribuirAmbientes, produtosIniciais } from "@/lib/data"
import type { Ambiente, Product } from "@/types"

const quarto: Ambiente = {
  id: "q",
  nome: "Quarto",
  slug: "quarto",
  imagem: "",
  ordem: 1,
  ativo: true,
  grupos: [
    {
      id: "q-idade",
      pergunta: "Para qual idade?",
      slug: "idade",
      multiplo: true,
      opcoes: [
        { id: "bebe", nome: "Bebê", slug: "bebe" },
        { id: "infantil", nome: "Infantil", slug: "infantil" },
        { id: "adulto", nome: "Adulto", slug: "adulto" },
      ],
    },
    {
      id: "q-quem",
      pergunta: "Para quem?",
      slug: "para-quem",
      multiplo: true,
      opcoes: [
        { id: "menina", nome: "Menina", slug: "menina" },
        { id: "menino", nome: "Menino", slug: "menino" },
        { id: "neutro", nome: "Neutro", slug: "neutro", combinaComTodas: true },
      ],
    },
  ],
}
const banheiro: Ambiente = { id: "b", nome: "Banheiro", slug: "banheiro", imagem: "", ordem: 2, ativo: true, grupos: [] }
const teto: Ambiente = { id: "t", nome: "Teto", slug: "teto", imagem: "", ordem: 3, ativo: true, grupos: [] }
const desativado: Ambiente = { id: "d", nome: "Varanda", slug: "varanda", imagem: "", ordem: 4, ativo: false, grupos: [] }
const taxonomia = [teto, banheiro, quarto, desativado]

const base = produtosIniciais[0]
function papel(id: string, ambientes: Product["ambientes"], extra: Partial<Product> = {}): Product {
  return { ...base, id, slug: id, nome: id, ambientes, ...extra }
}

const rosa = papel("rosa-infantil", [{ ambienteId: "q", opcoes: ["infantil", "menina"] }], {
  cores: [{ id: "rosa", nome: "Rosa", hex: "#e3a6bc" }],
})
const azul = papel("azul-infantil", [{ ambienteId: "q", opcoes: ["infantil", "menino"] }], {
  cores: [{ id: "azul", nome: "Azul", hex: "#8fa6d6" }],
})
const neutro = papel("neutro-bebe-infantil", [{ ambienteId: "q", opcoes: ["bebe", "infantil", "neutro"] }, { ambienteId: "b", opcoes: [] }], {
  cores: [{ id: "areia", nome: "Areia", hex: "#d9cfc2" }],
  materiais: base.materiais.filter((m) => m.id === "texturizado"),
})
const adultoMenina = papel("adulto-menina", [{ ambienteId: "q", opcoes: ["adulto", "menina"] }])
const soBanheiro = papel("so-banheiro", [{ ambienteId: "b", opcoes: [] }])
const semAmbiente = papel("sem-ambiente", [])
const produtos = [rosa, azul, neutro, adultoMenina, soBanheiro, semAmbiente]

const ids = (lista: { produto: Product }[]) => lista.map((r) => r.produto.id)
const filtro = (opcoes: FiltroAmbiente["opcoes"], ambiente = "quarto"): FiltroAmbiente => ({ ambiente, opcoes })

describe("filtro por ambiente", () => {
  it("só o ambiente: todos os papéis marcados nele", () => {
    expect(ids(filtrarPorAmbiente(produtos, taxonomia, filtro({})))).toEqual([rosa.id, azul.id, neutro.id, adultoMenina.id])
    expect(ids(filtrarPorAmbiente(produtos, taxonomia, filtro({}, "banheiro")))).toEqual([neutro.id, soBanheiro.id])
  })

  it("opções da mesma pergunta funcionam como OU", () => {
    const r = filtrarPorAmbiente(produtos, taxonomia, filtro({ idade: ["bebe", "adulto"] }))
    expect(ids(r)).toEqual([neutro.id, adultoMenina.id])
  })

  it("perguntas diferentes funcionam como E", () => {
    const r = filtrarPorAmbiente(produtos, taxonomia, filtro({ idade: ["adulto"], "para-quem": ["menino"] }))
    expect(ids(r)).toEqual([])
    const r2 = filtrarPorAmbiente(produtos, taxonomia, filtro({ idade: ["infantil"], "para-quem": ["menina"] }))
    expect(ids(r2)).toEqual([rosa.id, neutro.id])
  })

  it("Menina ou Menino incluem o Neutro, marcado como “combina com todos”", () => {
    const menina = filtrarPorAmbiente(produtos, taxonomia, filtro({ "para-quem": ["menina"] }))
    expect(menina.map((r) => [r.produto.id, r.combinaComTodos])).toEqual([
      [rosa.id, false],
      [neutro.id, true],
      [adultoMenina.id, false],
    ])
    const menino = filtrarPorAmbiente(produtos, taxonomia, filtro({ "para-quem": ["menino"] }))
    expect(ids(menino)).toEqual([azul.id, neutro.id])
    // Escolher o próprio Neutro não leva o selo
    const soNeutro = filtrarPorAmbiente(produtos, taxonomia, filtro({ "para-quem": ["neutro"] }))
    expect(soNeutro.map((r) => [r.produto.id, r.combinaComTodos])).toEqual([[neutro.id, false]])
  })

  it("combina com cor e material", () => {
    const porCor = filtrarProdutos(produtos, { cor: "rosa" })
    expect(ids(filtrarPorAmbiente(porCor, taxonomia, filtro({ idade: ["infantil"] })))).toEqual([rosa.id])
    const adesivo = filtrarProdutos(produtos, { material: "adesivo" })
    const r = filtrarPorAmbiente(adesivo, taxonomia, filtro({ idade: ["infantil"] }))
    expect(ids(r)).toEqual([rosa.id, azul.id]) // o neutro só tem texturizado
    expect(ids(filtrarPorAmbiente(filtrarProdutos(produtos, { cor: "areia" }), taxonomia, filtro({ "para-quem": ["menino"] })))).toEqual([neutro.id])
  })

  it("esconde ambientes sem papel ativo, desativados e opções sem uso", () => {
    const visiveis = ambientesVisiveis(taxonomia, produtos)
    expect(visiveis.map((a) => a.slug)).toEqual(["quarto", "banheiro"]) // ordem do cadastro; sem teto e varanda
    expect(visiveis[0].grupos.map((g) => g.opcoes.map((o) => o.slug))).toEqual([
      ["bebe", "infantil", "adulto"],
      ["menina", "menino", "neutro"],
    ])
    const soRosa = ambientesVisiveis(taxonomia, [rosa])
    expect(soRosa[0].grupos.map((g) => g.opcoes.map((o) => o.slug))).toEqual([["infantil"], ["menina"]])
    expect(ambientesVisiveis(taxonomia, [semAmbiente])).toEqual([])
  })

  it("ambiente desativado ou desconhecido na URL é ignorado", () => {
    const todos = filtrarPorAmbiente(produtos, taxonomia, filtro({}, "varanda"))
    expect(todos).toHaveLength(produtos.length)
    expect(lerFiltroAmbiente(new URLSearchParams("ambiente=varanda"), taxonomia).ambiente).toBeNull()
  })
})

describe("URL e textos", () => {
  it("lê e escreve o filtro na URL", () => {
    const lido = lerFiltroAmbiente(new URLSearchParams("ambiente=quarto&idade=infantil,xyz&para-quem=menina,neutro"), taxonomia)
    expect(lido).toEqual({ ambiente: "quarto", opcoes: { idade: ["infantil"], "para-quem": ["menina", "neutro"] } })
    const busca = new URLSearchParams()
    escreverFiltroAmbiente(busca, lido)
    expect(busca.toString()).toBe("ambiente=quarto&idade=infantil&para-quem=menina%2Cneutro")
  })

  it("marca e desmarca opções; pergunta de escolha única troca a opção", () => {
    const g = quarto.grupos[0]
    let f = alternarOpcao(filtro({}), g, "bebe")
    f = alternarOpcao(f, g, "infantil")
    expect(f.opcoes.idade).toEqual(["bebe", "infantil"])
    f = alternarOpcao(alternarOpcao(f, g, "bebe"), g, "infantil")
    expect(f.opcoes).toEqual({})
    const unica = { ...g, multiplo: false }
    expect(alternarOpcao(alternarOpcao(filtro({}), unica, "bebe"), unica, "adulto").opcoes.idade).toEqual(["adulto"])
  })

  it("descreve o filtro e os ambientes do papel", () => {
    expect(textoFiltroAmbiente(filtro({ idade: ["infantil"], "para-quem": ["menina"] }), taxonomia)).toBe("Quarto (Infantil • Menina)")
    expect(resumoAmbientes(neutro, taxonomia)).toBe("Quarto (Bebê, Infantil • Neutro), Banheiro")
    expect(indicacoesProduto(neutro, taxonomia).map((i) => i.ambiente.slug)).toEqual(["quarto", "banheiro"])
  })

  it("ordem aleatória estável pela semente da sessão", () => {
    const lista = produtosIniciais
    const a = ordenarComSemente(lista, 42, (p) => p.id)
    expect(ordenarComSemente(lista, 42, (p) => p.id)).toEqual(a)
    expect(a.map((p) => p.id)).not.toEqual(lista.map((p) => p.id))
    expect([...a].sort((x, y) => x.id.localeCompare(y.id))).toEqual([...lista].sort((x, y) => x.id.localeCompare(y.id)))
    // Filtrar não muda a ordem relativa dos que sobram
    const filtrados = ordenarComSemente(lista.filter((_, i) => i % 2 === 0), 42, (p) => p.id)
    expect(filtrados.map((p) => p.id)).toEqual(a.filter((p) => filtrados.includes(p)).map((p) => p.id))
    expect(ordenarComSemente(lista, null, (p) => p.id)).toBe(lista)
  })
})

describe("cadastro e exclusão", () => {
  it("conta e remove referências de ambiente e de opção", () => {
    expect(produtosQueUsam(produtos, "q")).toBe(4)
    expect(produtosQueUsam(produtos, "q", "menina")).toBe(2)
    expect(removerReferencia(neutro, "b").ambientes.map((a) => a.ambienteId)).toEqual(["q"])
    expect(removerReferencia(neutro, "q", ["bebe"]).ambientes[0].opcoes).toEqual(["infantil", "neutro"])
    expect(removerReferencia(soBanheiro, "q")).toBe(soBanheiro)
  })

  it("admin exige ambiente e uma opção em cada pergunta", () => {
    const form = produtoParaForm({ ...rosa, slug: "novo-rosa" })
    form.ambientes = []
    expect(validarProduto(form, produtos, taxonomia).erros.ambientes).toMatch(/pelo menos um ambiente/)
    form.ambientes = [{ ambienteId: "q", opcoes: ["infantil"] }]
    const { erros } = validarProduto(form, produtos, taxonomia)
    expect(erros["ambientes.q.q-quem"]).toBe("Quarto: marque pelo menos uma opção em “Para quem?”.")
    expect(erros["ambientes.q.q-idade"]).toBeUndefined()
    form.ambientes = [{ ambienteId: "t", opcoes: [] }, { ambienteId: "q", opcoes: ["menina", "infantil"] }]
    const ok = validarProduto(form, produtos, taxonomia)
    expect(ok.erros).toEqual({})
    // Opções ficam na ordem do cadastro
    expect(ok.produto?.ambientes).toEqual([{ ambienteId: "t", opcoes: [] }, { ambienteId: "q", opcoes: ["infantil", "menina"] }])
  })
})

describe("dados de exemplo", () => {
  it("todo papel tem pelo menos 2 ambientes, com opção em cada pergunta", () => {
    for (const p of produtosIniciais) {
      expect(p.ambientes.length, p.slug).toBeGreaterThanOrEqual(2)
      const { erros } = validarProduto(produtoParaForm(p), produtosIniciais, ambientesIniciais)
      expect(erros, p.slug).toEqual({})
    }
  })

  it("distribuição é sempre a mesma (semente fixa)", () => {
    const base = produtosIniciais.map((p) => ({ ...p, ambientes: [] }))
    expect(distribuirAmbientes(base, ambientesIniciais)).toEqual(produtosIniciais)
    expect(distribuirAmbientes(base, ambientesIniciais, 7)).not.toEqual(produtosIniciais)
  })

  it("todos os ambientes de exemplo têm papel", () => {
    expect(ambientesVisiveis(ambientesIniciais, produtosIniciais)).toHaveLength(ambientesIniciais.length)
  })
})
