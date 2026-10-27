/** Simulações com IA permitidas por sessão do navegador. */
export const LIMITE_SIMULACOES = 6

export const AVISO_SIMULACAO =
  "Esta é uma simulação aproximada feita por inteligência artificial, apenas para dar uma ideia de como ficaria. O resultado final pode variar. Nossa equipe confirma tudo antes da produção."

export interface RespostaSimulacao {
  /** Imagem gerada pela IA (data URL); null no modo demonstração */
  imagem: string | null
  demonstracao: boolean
  restantes: number
}
