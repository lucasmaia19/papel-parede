import type {
  Categoria,
  CorProduto,
  GrupoPersonalizacao,
  MedidaElemento,
  Product,
  Settings,
  WorkGallery,
} from "@/types"
import { materiaisPadrao } from "@/lib/materiais"

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

const img = (arquivo: string) => `/img/produtos/${arquivo}.webp`

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
  /** Cor única de cada papel: [id, nome, hex] */
  cor: [string, string, string]
  /** Fotos em public/img/produtos (sem extensão); a primeira é a principal. Ver scripts/importar-fotos.mjs */
  fotos: { arquivo: string; alt: string }[]
  /** Preço/m² dos materiais (⚠️ fictício: R$ 80 nas estampas) */
  precoM2?: number
  /** Linho sem estampa: só o material texturizado */
  somenteTexturizado?: boolean
  prontaEntrega?: boolean
  prazoProducaoDias?: number
  grupos?: GrupoPersonalizacao[]
  /** Escala da foto principal; sem ela, não há régua (calibrar no admin clicando em dois pontos) */
  pixelsPorCm?: number
  medidas?: MedidaElemento[]
  ia?: string[]
}

function produto(n: number, b: Base): Product {
  const [corId, corNome, hex] = b.cor
  const imagens = b.fotos.map((f, i) => ({ id: `p${n}-${i + 1}`, url: img(f.arquivo), alt: f.alt }))
  const cor: CorProduto = { id: corId, nome: corNome, hex, imagem: imagens[0].url }
  return {
    id: `p${n}`,
    slug: b.slug,
    nome: b.nome,
    descricao: b.descricao,
    categoria: b.categoria,
    imagens,
    precoM2: b.precoM2 ?? 80,
    materiais: materiaisPadrao(b.precoM2 ?? 80, b.somenteTexturizado),
    prontaEntrega: b.prontaEntrega ?? false,
    prazoProducaoDias: b.prazoProducaoDias ?? 7,
    ativo: true,
    cores: [cor],
    gruposPersonalizacao: b.grupos ?? [],
    regua: b.pixelsPorCm ? { pixelsPorCm: b.pixelsPorCm, medidas: b.medidas ?? [] } : null,
    iaHabilitada: Boolean(b.ia?.length),
    sugestoesIA: b.ia ?? [],
  }
}

const tamanhoEstampa = (id: string) => grupo(id, "Tamanho da estampa", [["P"], ["M"], ["G", 6]])

export const produtosIniciais: Product[] = [
  produto(1, {
    slug: "delicado",
    nome: "Delicado",
    descricao:
      "Raminhos de flores azuis e lacinhos entre listras pontilhadas, sobre fundo creme. Suave e romântico, para quartos de bebê, de criança e de adulto.",
    categoria: "floral",
    cor: ["azul", "Azul", "#8FA6D6"],
    fotos: [{ arquivo: "delicado", alt: "Papel Delicado: raminhos de flores azuis e lacinhos sobre fundo creme" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar as flores azuis por rosas", "Tirar os lacinhos e deixar só as flores", "Deixar as listras em rosa"],
  }),
  produto(2, {
    slug: "lacos-e-flores",
    nome: "Laços e Flores",
    descricao:
      "Laços cor-de-rosa formando uma treliça, com florzinhas em aquarela entre eles. Delicado e cheio de afeto, perfeito para quarto de menina.",
    categoria: "infantil",
    cor: ["rosa", "Rosa", "#E3A6BC"],
    fotos: [{ arquivo: "lacos-e-flores", alt: "Parede com papel de laços rosa e flores atrás de um espelho oval" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar o rosa dos laços por azul-claro", "Tirar as flores e deixar só os laços"],
  }),
  produto(3, {
    slug: "listra-e-flores",
    nome: "Listra e Flores",
    descricao:
      "Listras lavanda intercaladas com florzinhas rosas. Clássico e aconchegante, combina com rodameio e boiserie.",
    categoria: "listrado",
    cor: ["lavanda", "Lavanda e rosa", "#B8BCD6"],
    fotos: [
      { arquivo: "listra-e-flores-1", alt: "Parede com papel de listras lavanda e flores rosas e dois quadros" },
      { arquivo: "listra-e-flores-2", alt: "Quarto com papel de listras e flores atrás de uma cabeceira cinza" },
    ],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar as listras por verde-sálvia", "Deixar as flores em azul"],
  }),
  produto(4, {
    slug: "ramos-e-lacos",
    nome: "Ramos e Laços",
    descricao:
      "Ramos de flores azuis e laços entre listras onduladas em rosé. Leve e romântico, para quartos e lavabos.",
    categoria: "floral",
    cor: ["azul", "Azul e rosé", "#A9C1DC"],
    fotos: [{ arquivo: "ramos-e-lacos", alt: "Papel Ramos e Laços: ramos de flores azuis e laços entre listras onduladas" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar os laços azuis por rosa", "Deixar só os ramos, sem laços"],
  }),
  produto(5, {
    slug: "flores-linho",
    nome: "Flores Linho",
    descricao:
      "Flores grandes sobrepostas em azul acinzentado, com fundo que imita a trama do linho. Calmo e elegante para salas e quartos.",
    categoria: "floral",
    cor: ["azul", "Azul acinzentado", "#A9BCCB"],
    fotos: [{ arquivo: "flores-linho", alt: "Papel Flores Linho: flores grandes em azul acinzentado" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar o azul por rosa-claro", "Trocar o azul por verde-sálvia"],
  }),
  produto(6, {
    slug: "toile-de-jouy",
    nome: "Toile de Jouy",
    descricao:
      "Cenas campestres desenhadas em azul acinzentado, no estilo clássico francês. Sofisticado e cheio de detalhes, lindo em quartos e salas.",
    categoria: "estampado",
    prazoProducaoDias: 10,
    cor: ["azul", "Azul acinzentado", "#8FA7AE"],
    fotos: [
      { arquivo: "toile-de-jouy-1", alt: "Quarto com papel Toile de Jouy azul acima da cabeceira" },
      { arquivo: "toile-de-jouy-2", alt: "Detalhe do papel Toile de Jouy com cenas campestres em azul" },
    ],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar o azul por rosa antigo", "Trocar o azul por verde-sálvia"],
  }),
  produto(7, {
    slug: "azulejos-cozinha",
    nome: "Azulejos Cozinha",
    descricao:
      "Azulejos portugueses desenhados em azul, rosé e areia, com aspecto envelhecido. Dá charme a cozinhas, lavabos e áreas gourmet.",
    categoria: "estampado",
    cor: ["azul", "Azul e areia", "#8A9BB5"],
    fotos: [{ arquivo: "azulejos-cozinha", alt: "Papel Azulejos Cozinha: azulejos desenhados em azul, rosé e areia" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar o azul por verde-sálvia", "Deixar os azulejos só em tons de rosa"],
  }),
  produto(8, {
    slug: "xadrez-3cm",
    nome: "Xadrez 3 cm",
    descricao:
      "Xadrez vichy em azul bem clarinho, com quadrados de 3 cm. Delicado e fácil de combinar, para quarto de bebê, cozinha e lavabo.",
    categoria: "quadriculado",
    cor: ["azul", "Azul-claro", "#DCE6F4"],
    fotos: [{ arquivo: "xadrez-3cm", alt: "Papel xadrez vichy azul-claro com quadrados de 3 cm" }],
    // ⚠️ Escala estimada pela própria foto (quadrado de 32 px = 3 cm): confirmar com a loja
    pixelsPorCm: 10.667,
    medidas: [medida("m1", "Cada quadrado", 3, 3)],
    ia: ["Trocar o azul por rosa-claro", "Trocar o azul por verde-sálvia"],
  }),
  produto(9, {
    slug: "xadrez-aquarela",
    nome: "Xadrez Aquarela",
    descricao:
      "Xadrez pintado em aquarela, em azul e areia. Tem o charme do feito à mão, para quartos de criança e ambientes descontraídos.",
    categoria: "quadriculado",
    cor: ["azul", "Azul e areia", "#A8C0D6"],
    fotos: [{ arquivo: "xadrez-aquarela", alt: "Papel xadrez em aquarela nas cores azul e areia" }],
    grupos: [tamanhoEstampa("estampa")],
    ia: ["Trocar o azul por rosa", "Deixar o xadrez só em areia"],
  }),
  produto(10, {
    slug: "madeira-fria",
    nome: "Madeira Fria",
    descricao: "Imita madeira clara, com veios naturais em tom de carvalho. Traz aconchego sem pesar o ambiente.",
    categoria: "texturizado",
    cor: ["carvalho", "Carvalho claro", "#C9A47A"],
    fotos: [{ arquivo: "madeira-fria", alt: "Papel que imita madeira clara com veios naturais" }],
    ia: ["Deixar a madeira mais clara", "Deixar a madeira mais acinzentada"],
  }),
  produto(11, {
    slug: "madeira-louro-freijo",
    nome: "Madeira Louro Freijó",
    descricao:
      "Imita a madeira louro freijó, em tom de mel com veios marcados. Elegante em painéis de TV, cabeceiras e escritórios.",
    categoria: "texturizado",
    cor: ["freijo", "Louro freijó", "#A86F3E"],
    fotos: [{ arquivo: "madeira-louro-freijo", alt: "Papel que imita madeira louro freijó em tom de mel" }],
    ia: ["Deixar a madeira mais clara", "Deixar a madeira mais escura"],
  }),
  produto(12, {
    slug: "cimento-queimado-areia",
    nome: "Cimento Queimado Areia",
    descricao: "O visual do cimento queimado em tom areia, com manchas suaves. Moderno e acolhedor ao mesmo tempo.",
    categoria: "texturizado",
    cor: ["areia", "Areia", "#D9CFC2"],
    fotos: [{ arquivo: "cimento-queimado-areia", alt: "Papel com efeito de cimento queimado em tom areia" }],
    ia: ["Deixar o cimento mais claro", "Trocar o tom areia por cinza-claro"],
  }),
  // Pronta entrega: só o linho com textura, sem estampa
  produto(13, {
    slug: "linho-texturizado-off-white",
    nome: "Linho texturizado Off-white",
    descricao:
      "Linho com textura na cor off-white, sem estampa. Um tom quente e suave que combina com tudo. Já na loja, com envio imediato.",
    categoria: "texturizado",
    precoM2: 85,
    prontaEntrega: true,
    somenteTexturizado: true,
    prazoProducaoDias: 0,
    cor: ["off-white", "Off-white", "#EEE8E0"],
    fotos: [{ arquivo: "linho-texturizado-off-white", alt: "Papel de linho texturizado off-white, sem estampa" }],
  }),
]

export const trabalhosIniciais: WorkGallery[] = [
  {
    id: "t1",
    titulo: "Mural de flores e borboletas no quarto",
    // ⚠️ Cidade a confirmar com a loja
    cidade: "Uberlândia",
    fotoAntes: "",
    fotoDepois: "/img/trabalhos/mural-floral.webp",
    destaque: true,
  },
]
