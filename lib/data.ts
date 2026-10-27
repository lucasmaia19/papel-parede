import type {
  Categoria,
  CorProduto,
  GrupoPersonalizacao,
  MedidaElemento,
  Product,
  Settings,
  WorkGallery,
} from "@/types"

export const settingsIniciais: Settings = {
  precoM2Padrao: 80,
  valorAplicacaoM2: 25,
  valorVisitaMedicao: 50,
  margemPerda: 10,
  descontoPix: 5,
  cidadesAtendidas: [
    {
      id: "uberlandia",
      nome: "Uberlândia",
      uf: "MG",
      taxaDeslocamento: 0,
      faixasCep: [{ inicio: "38400", fim: "38499" }],
    },
    {
      id: "araguari",
      nome: "Araguari",
      uf: "MG",
      taxaDeslocamento: 60,
      faixasCep: [{ inicio: "38440", fim: "38449" }],
    },
    {
      id: "uberaba",
      nome: "Uberaba",
      uf: "MG",
      taxaDeslocamento: 90,
      faixasCep: [{ inicio: "38000", fim: "38199" }],
    },
  ],
  tabelaFrete: [
    { regiao: "MG", valor: 30, prazoDias: 3 },
    { regiao: "Sudeste", valor: 45, prazoDias: 5 },
    { regiao: "Sul", valor: 60, prazoDias: 7 },
    { regiao: "Centro-Oeste", valor: 55, prazoDias: 6 },
    { regiao: "Nordeste", valor: 75, prazoDias: 9 },
    { regiao: "Norte", valor: 90, prazoDias: 12 },
  ],
  freteGratisAcimaDe: 1000,
  whatsapp: "5534996804044",
  instagram: "https://www.instagram.com/rodovalhopapeisdeparede/",
  endereco: "R. José Joaquim Francisco, 229 - Vigilato Pereira, Uberlândia - MG, 38408-610",
  textoAtendimento: "Atendimento presencial somente com hora marcada",
}

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  estampado: "Estampados",
  listrado: "Listrados",
  quadriculado: "Quadriculados",
  floral: "Florais",
  infantil: "Infantis",
  texturizado: "Texturizados",
  liso: "Lisos",
}

const img = (slug: string, sufixo: string) => `/img/produtos/${slug}-${sufixo}.svg`

function cores(slug: string, lista: [id: string, nome: string, hex: string][]): CorProduto[] {
  return lista.map(([id, nome, hex]) => ({ id, nome, hex, imagem: img(slug, id) }))
}

function grupo(id: string, nome: string, opcoes: [rotulo: string, acrescimo?: number][]): GrupoPersonalizacao {
  return {
    id,
    nome,
    opcoes: opcoes.map(([rotulo, acrescimoM2], i) => ({
      id: `${id}-${i}`,
      rotulo,
      ...(acrescimoM2 ? { acrescimoM2 } : {}),
    })),
  }
}

function medida(id: string, rotulo: string, larguraCm: number, alturaCm = 0): MedidaElemento {
  return { id, rotulo, larguraCm, alturaCm }
}

interface Base {
  slug: string
  nome: string
  descricao: string
  categoria: Categoria
  cores: [string, string, string][]
  precoM2?: number
  prontaEntrega?: boolean
  prazoProducaoDias?: number
  grupos?: GrupoPersonalizacao[]
  medidas?: MedidaElemento[]
  ia?: string[]
}

function produto(n: number, b: Base): Product {
  const listaCores = cores(b.slug, b.cores)
  return {
    id: `p${n}`,
    slug: b.slug,
    nome: b.nome,
    descricao: b.descricao,
    categoria: b.categoria,
    imagens: [
      { id: `p${n}-1`, url: listaCores[0].imagem!, alt: `${b.nome} — amostra` },
      { id: `p${n}-2`, url: img(b.slug, "ambiente"), alt: `${b.nome} aplicado em um ambiente` },
    ],
    precoM2: b.precoM2 ?? 80,
    prontaEntrega: b.prontaEntrega ?? false,
    prazoProducaoDias: b.prazoProducaoDias ?? 7,
    ativo: true,
    cores: listaCores,
    gruposPersonalizacao: b.grupos ?? [],
    // As amostras têm 1200 px para 60 cm
    regua: { pixelsPorCm: 20, medidas: b.medidas ?? [] },
    iaHabilitada: Boolean(b.ia?.length),
    sugestoesIA: b.ia ?? [],
  }
}

const tamanhoEstampa = (id: string) => grupo(id, "Tamanho da estampa", [["P"], ["M"], ["G", 6]])

export const produtosIniciais: Product[] = [
  produto(1, {
    slug: "listrado-classico",
    nome: "Listrado Clássico",
    descricao:
      "Listras verticais largas, em tom suave sobre fundo creme. Deixa o ambiente mais alto e organizado. Fica bonito em salas, quartos e corredores.",
    categoria: "listrado",
    cores: [
      ["azul", "Azul", "#8EAAC4"],
      ["rosa", "Rosa", "#E2B3B4"],
    ],
    grupos: [grupo("listra", "Largura da listra", [["3 cm", 5], ["5 cm"], ["8 cm"]])],
    medidas: [medida("m1", "Cada listra", 5)],
    ia: ["Trocar o azul por verde-sálvia", "Deixar as listras mais finas", "Usar listras em dois tons"],
  }),
  produto(2, {
    slug: "listrado-riviera",
    nome: "Listrado Riviera",
    descricao:
      "Uma listra larga acompanhada de duas listras finas. Visual de casa de praia, leve e elegante.",
    categoria: "listrado",
    cores: [
      ["salvia", "Verde-sálvia", "#9DAE98"],
      ["areia", "Areia", "#CDB894"],
    ],
    medidas: [medida("m1", "Listra larga", 6), medida("m2", "Listras finas", 1)],
  }),
  produto(3, {
    slug: "xadrez-vichy",
    nome: "Xadrez Vichy",
    descricao:
      "O quadriculado clássico de toalha de piquenique, em versão delicada. Combina com cozinhas, quartos e lavabos.",
    categoria: "quadriculado",
    cores: [
      ["azul", "Azul", "#5F84AA"],
      ["verde", "Verde", "#6E8A6A"],
      ["terracota", "Terracota", "#B86F52"],
    ],
    grupos: [grupo("quadrado", "Tamanho do quadrado", [["5 cm", 8], ["10 cm"], ["15 cm"]])],
    medidas: [medida("m1", "Cada quadrado", 10, 10)],
    ia: ["Trocar o azul por amarelo-mostarda", "Deixar os quadrados maiores"],
  }),
  produto(4, {
    slug: "grade-fina",
    nome: "Grade Fina",
    descricao: "Linhas finas formando quadrados, sobre fundo claro. Discreto, moderno e fácil de combinar.",
    categoria: "quadriculado",
    cores: [
      ["grafite", "Grafite", "#55524D"],
      ["areia", "Areia", "#C2AE8C"],
    ],
    grupos: [grupo("quadrado", "Tamanho do quadrado", [["5 cm", 8], ["10 cm"], ["15 cm"]])],
    medidas: [medida("m1", "Cada quadrado", 10, 10)],
  }),
  produto(5, {
    slug: "borboletas",
    nome: "Borboletas",
    descricao:
      "Borboletas desenhadas à mão, em dois tamanhos, sobre fundo creme. Alegre sem ser infantil: vai bem em quartos, salas e lavabos.",
    categoria: "estampado",
    cores: [
      ["azul", "Azul", "#7E9CC0"],
      ["lilas", "Lilás", "#A894C4"],
    ],
    grupos: [tamanhoEstampa("estampa")],
    medidas: [medida("m1", "Borboleta grande", 6, 6), medida("m2", "Borboleta pequena", 3, 3)],
    ia: [
      "Trocar a cor das borboletas para lilás",
      "Substituir as borboletas por pássaros",
      "Deixar o fundo verde-claro",
    ],
  }),
  produto(6, {
    slug: "floral-jardim",
    nome: "Floral Jardim",
    descricao: "Flores e folhas espalhadas, como um jardim de interior. Romântico e acolhedor.",
    categoria: "floral",
    cores: [
      ["rosa", "Rosa", "#D9A1A3"],
      ["verde", "Verde", "#6F8768"],
    ],
    grupos: [tamanhoEstampa("estampa")],
    medidas: [medida("m1", "Flor grande", 7, 7), medida("m2", "Flor pequena", 3, 3)],
    ia: ["Trocar as flores rosas por amarelas", "Deixar só as folhas, sem flores"],
  }),
  produto(7, {
    slug: "arabesco-imperial",
    nome: "Arabesco Imperial",
    descricao:
      "Arabesco clássico em linhas curvas, com acabamento sóbrio. Dá um ar sofisticado a salas de jantar, halls e escritórios.",
    categoria: "estampado",
    precoM2: 95,
    prazoProducaoDias: 10,
    cores: [
      ["dourado", "Dourado", "#C3A774"],
      ["cinza", "Cinza", "#A3A19C"],
    ],
    medidas: [medida("m1", "Cada arabesco", 16, 24)],
    ia: ["Trocar o dourado por verde-escuro", "Deixar as linhas mais finas"],
  }),
  produto(8, {
    slug: "nuvens-e-estrelas",
    nome: "Nuvens e Estrelas",
    descricao: "Nuvens fofinhas e estrelinhas douradas. Perfeito para quarto de bebê e de criança.",
    categoria: "infantil",
    cores: [
      ["azul", "Azul", "#CCDCEA"],
      ["rosa", "Rosa", "#F1D7D7"],
    ],
    grupos: [tamanhoEstampa("estampa")],
    medidas: [medida("m1", "Nuvem grande", 9, 5)],
    ia: ["Trocar as estrelas por luas", "Colocar balões entre as nuvens", "Deixar o fundo amarelo-claro"],
  }),
  produto(9, {
    slug: "arco-iris",
    nome: "Arco-íris",
    descricao: "Pequenos arco-íris em tons suaves. Alegre e delicado para quartos infantis e brinquedotecas.",
    categoria: "infantil",
    cores: [
      ["terracota", "Terracota", "#C47F62"],
      ["pastel", "Pastel", "#E3A9A9"],
    ],
    medidas: [medida("m1", "Cada arco-íris", 8, 4)],
    ia: ["Usar só tons de azul", "Colocar nuvens embaixo dos arco-íris"],
  }),
  // Pronta entrega: só o linho com textura, sem estampa, em branco e off-white
  produto(10, {
    slug: "linho-texturizado-branco",
    nome: "Linho texturizado Branco",
    descricao:
      "Linho com textura na cor branca, sem estampa. Liso de longe, com a trama do linho de perto. Já na loja, com envio imediato.",
    categoria: "texturizado",
    precoM2: 85,
    prontaEntrega: true,
    prazoProducaoDias: 0,
    cores: [["branco", "Branco", "#F8F7F3"]],
  }),
  produto(11, {
    slug: "linho-texturizado-off-white",
    nome: "Linho texturizado Off-white",
    descricao:
      "Linho com textura na cor off-white, sem estampa. Um tom quente e suave que combina com tudo. Já na loja, com envio imediato.",
    categoria: "texturizado",
    precoM2: 85,
    prontaEntrega: true,
    prazoProducaoDias: 0,
    cores: [["off-white", "Off-white", "#EFE8DA"]],
  }),
  produto(12, {
    slug: "liso-fosco",
    nome: "Liso Fosco",
    descricao: "Cor única, fosca, com leve textura. Renova a parede sem pintura e sem cheiro.",
    categoria: "liso",
    precoM2: 70,
    prazoProducaoDias: 5,
    cores: [
      ["branco", "Branco", "#F9F8F5"],
      ["off-white", "Off-white", "#F1EADF"],
    ],
  }),
]

const foto = (id: string, momento: "antes" | "depois") => `/img/trabalhos/${id}-${momento}.svg`

export const trabalhosIniciais: WorkGallery[] = [
  {
    id: "t1",
    titulo: "Sala de estar com listras azuis",
    cidade: "Uberlândia",
    fotoAntes: foto("sala-listrada", "antes"),
    fotoDepois: foto("sala-listrada", "depois"),
    produtoId: "p1",
    destaque: true,
  },
  {
    id: "t2",
    titulo: "Quarto de bebê com nuvens",
    cidade: "Araguari",
    fotoAntes: foto("quarto-infantil", "antes"),
    fotoDepois: foto("quarto-infantil", "depois"),
    produtoId: "p8",
    destaque: true,
  },
  {
    id: "t3",
    titulo: "Hall de entrada com arabesco",
    cidade: "Uberaba",
    fotoAntes: foto("hall-arabesco", "antes"),
    fotoDepois: foto("hall-arabesco", "depois"),
    produtoId: "p7",
    destaque: true,
  },
  {
    id: "t4",
    titulo: "Quarto de casal floral",
    cidade: "Uberlândia",
    fotoAntes: foto("quarto-floral", "antes"),
    fotoDepois: foto("quarto-floral", "depois"),
    produtoId: "p6",
    destaque: false,
  },
]
