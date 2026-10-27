/** Id curto e único o suficiente para dados locais (funciona também fora de contexto seguro, sem crypto.randomUUID). */
export function gerarIdSimples(prefixo = ""): string {
  return `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
