export const CATEGORIAS = [
  "estampado",
  "listrado",
  "quadriculado",
  "floral",
  "infantil",
  "texturizado",
  "liso",
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export interface ImagemProduto {
  id: string
  /** Caminho em /public ou data URL (base64) enviado pelo admin */
  url: string
  alt: string
}

export interface CorProduto {
  id: string
  nome: string
  hex: string
  /** Foto da variação de cor (opcional) */
  imagem?: string
}

export interface OpcaoPersonalizacao {
  id: string
  rotulo: string
  /** Acréscimo em R$ por m² (opcional) */
  acrescimoM2?: number
}

export interface GrupoPersonalizacao {
  id: string
  nome: string
  opcoes: OpcaoPersonalizacao[]
}

export interface MedidaElemento {
  id: string
  rotulo: string
  larguraCm: number
  alturaCm: number
}

export interface Regua {
  /** Pixels por centímetro na imagem principal, em tamanho natural */
  pixelsPorCm: number
  medidas: MedidaElemento[]
}

/** Material em que a estampa é vendida (ex.: texturizado linho, adesivo liso) */
export interface MaterialProduto {
  id: string
  nome: string
  /** Uma linha, em linguagem simples */
  descricao: string
  precoM2: number
  ativo: boolean
}

/** Opção de uma pergunta do ambiente (ex.: "Menina" em "Para quem?") */
export interface OpcaoAmbiente {
  id: string
  nome: string
  slug: string
  /** Papel com esta opção aparece em qualquer escolha da pergunta, com o selo "Combina com todos" (ex.: Neutro) */
  combinaComTodas?: boolean
}

/** Pergunta do filtro dentro de um ambiente (ex.: "Para qual idade?") */
export interface GrupoAmbiente {
  id: string
  pergunta: string
  /** Nome do parâmetro na URL (?idade=infantil) */
  slug: string
  /** O cliente pode marcar mais de uma opção (funcionam como "ou") */
  multiplo: boolean
  opcoes: OpcaoAmbiente[]
}

export interface Ambiente {
  id: string
  nome: string
  slug: string
  /** Ilustração em /public ou data URL enviada pelo admin */
  imagem: string
  ordem: number
  ativo: boolean
  /** Frase curta de destaque (ex.: "Combina com o papel adesivo lavável") */
  destaque?: string
  grupos: GrupoAmbiente[]
}

/** Onde o papel pode ser usado: o ambiente e os ids das opções marcadas */
export interface AmbienteProduto {
  ambienteId: string
  opcoes: string[]
}

export interface Product {
  id: string
  slug: string
  nome: string
  descricao: string
  categoria: Categoria
  /** Ordenadas; a primeira é a principal */
  imagens: ImagemProduto[]
  /** Menor preço/m² entre os materiais ativos ("a partir de") */
  precoM2: number
  materiais: MaterialProduto[]
  prontaEntrega: boolean
  prazoProducaoDias: number
  ativo: boolean
  cores: CorProduto[]
  gruposPersonalizacao: GrupoPersonalizacao[]
  regua: Regua | null
  iaHabilitada: boolean
  sugestoesIA: string[]
  /** Ambientes indicados (um papel pode servir para vários) */
  ambientes: AmbienteProduto[]
}

export interface FaixaCep {
  /** 5 primeiros dígitos, inclusive */
  inicio: string
  fim: string
}

export interface CidadeAtendida {
  id: string
  nome: string
  uf: string
  taxaDeslocamento: number
  faixasCep: FaixaCep[]
}

export const REGIOES = ["MG", "Sudeste", "Sul", "Centro-Oeste", "Nordeste", "Norte"] as const

export type Regiao = (typeof REGIOES)[number]

export interface FaixaFrete {
  regiao: Regiao
  valor: number
  prazoDias: number
}

export interface Settings {
  precoM2Padrao: number
  valorAplicacaoM2: number
  valorVisitaMedicao: number
  /** % */
  margemPerda: number
  /** % */
  descontoPix: number
  cidadesAtendidas: CidadeAtendida[]
  tabelaFrete: FaixaFrete[]
  /** null = sem frete grátis */
  freteGratisAcimaDe: number | null
  /** Só dígitos, com DDI: 5534996804044 */
  whatsapp: string
  instagram: string
  endereco: string
  textoAtendimento: string
}

export type TipoAbertura = "porta" | "janela"

export interface Abertura {
  id: string
  tipo: TipoAbertura
  largura: number
  altura: number
}

export interface Parede {
  id: string
  largura: number
  altura: number
  aberturas: Abertura[]
}

export interface PersonalizacaoEscolhida {
  grupo: string
  opcao: string
  acrescimoM2: number
}

export interface SimulacaoIA {
  tipo: "estampa" | "parede"
  observacao: string
  /** Imagem simulada comprimida (data URL) */
  imagem?: string
}

export interface ServicosItem {
  aplicacao: boolean
  visita: boolean
}

export interface CartItem {
  id: string
  produtoId: string
  produtoNome: string
  produtoSlug: string
  imagem: string
  cor: { nome: string; hex: string }
  /** Opcional só para itens antigos, salvos antes de existir a escolha de material */
  material?: { id: string; nome: string }
  personalizacoes: PersonalizacaoEscolhida[]
  paredes: Parede[]
  /** m² cobrados (já com margem de perda) */
  m2: number
  /** m² da parede, sem perda — base da aplicação */
  m2Parede: number
  precoM2: number
  servicos: ServicosItem
  simulacao?: SimulacaoIA
  prontaEntrega: boolean
  prazoProducaoDias: number
}

export type Modalidade = "entrega" | "aplicacao"

export type FormaPagamento = "pix" | "cartao" | "boleto" | "whatsapp"

export type CanalPedido = "site" | "whatsapp"

export const STATUS_PEDIDO = [
  "Novo",
  "Medição agendada",
  "Em produção",
  "Enviado",
  "Aplicado",
  "Concluído",
] as const

export type StatusPedido = (typeof STATUS_PEDIDO)[number]

export interface Cliente {
  nome: string
  telefone: string
  email: string
  cpf?: string
}

export interface Endereco {
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
}

export interface ItemPedido extends CartItem {
  subtotalPapel: number
  subtotalAplicacao: number
  subtotal: number
}

export interface Order {
  id: string
  numero: number
  cliente: Cliente
  endereco: Endereco
  itens: ItemPedido[]
  modalidade: Modalidade
  /** CEP em cidade atendida (aplicação/visita possíveis) */
  naRegiao: boolean
  frete: number
  deslocamento: number
  visita: number
  prazoEntregaDias: number | null
  /** Prazo estimado em texto, como mostrado ao cliente */
  prazoTexto: string
  descontoPix: number
  total: number
  formaPagamento: FormaPagamento
  canal: CanalPedido
  status: StatusPedido
  /** ISO */
  data: string
}

export interface WorkGallery {
  id: string
  titulo: string
  cidade: string
  fotoAntes: string
  fotoDepois: string
  produtoId?: string
  destaque: boolean
}
