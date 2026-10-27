# Progresso — Rodovalho Papéis de Parede

Decisões: cor de destaque **verde-sálvia escuro**; componentes **shadcn/ui (base Base UI)** customizados;
Next.js 16.4 (App Router, Cache Components ligado), Tailwind v4, Zustand + persist, Vitest, Playwright.

## Fase 1 — Base ✅

- [x] Projeto Next.js 16.4 + dependências (shadcn/Base UI, Zustand, Vitest, Playwright). `.npmrc` com `legacy-peer-deps` (bug do npm 10 ao instalar o Vitest)
- [x] Tema visual: tokens CSS em `app/globals.css` (paleta papel, verde-sálvia `#43584A`), Fraunces + Figtree, texto base 18px, cantos 3–6px
- [x] Componentes base customizados (Button ≥ 48px com variante WhatsApp, Input 56px, Sheet/Dialog com botão "Fechar" escrito, Tabs, Switch, Badge…)
- [x] Layout: header fixo com "Carrinho" e "Menu" (ícone + texto), gaveta de menu com WhatsApp/Instagram, rodapé (contato, endereço, mapa lazy, hora marcada, regiões e taxas), WhatsApp flutuante (sobe com `--barra-inferior`)
- [x] Tipos (`types/index.ts`)
- [x] Seeds (`lib/data.ts`): 12 produtos, 4 trabalhos, configurações; 47 SVGs gerados por `npm run gerar:imagens` (amostras a 20 px/cm, ambientes, antes/depois)
- [x] Store Zustand com persist (`skipHydration` + `<StoreHydration />`, `useHidratado()`; não quebra se o localStorage encher)
- [x] `lib/pricing.ts` + `lib/cep.ts` + 27 testes Vitest
- [x] Playwright (360/390/430/1280) com verificações de rolagem horizontal, elementos cortados e botões ≥ 48px
- [x] lint, tsc, build, testes e screenshots revisados (ajustes: botão "Fechar" 44→48px; número do WhatsApp quebrando no menu em 360px)
- [x] Commit

Regras de preço adotadas (confirmar com a loja):
- m² cobrado = área das paredes − portas/janelas, + margem de perda, arredondado para cima (centésimos).
- Aplicação cobrada pela área real da parede (sem a margem de perda).
- Visita e deslocamento: uma vez por pedido. Na cidade atendida, o deslocamento é cobrado também como entrega.
- Frete grátis compara com o valor do papel. Desconto Pix sobre o total.

## Fase 2 — Catálogo ✅
- [x] Card de produto minimalista (foto 4:5, nome, "R$ 80,00/m²", amostras de cor, selo "Pronta entrega"; o card inteiro é link)
- [x] Home: foto grande, título + 1 botão, faixa "Enviamos para todo o Brasil • Aplicamos em…", 3 chamadas editoriais (Calcule / Veja na sua parede / Pronta entrega), estilos, mais procurados, trechos da galeria
- [x] /produtos: filtros por estilo e cor com botões grandes (gaveta inferior no celular com "Ver N papéis"; coluna lateral no desktop), filtros na URL, chips para remover, "Limpar filtros", estado vazio
- [x] Cores do filtro limitadas ao estilo escolhido (evita filtro sem resultado)
- [x] /pronta-entrega com destaque para texturizados e lisos Branco/Off-white
- [x] Testes Playwright (home, filtros, pronta entrega) nas 4 larguras + screenshots revisados (ajustes: cabeçalho e "Fechar" fixos na gaveta; "•" da faixa no celular)
- [x] Commit

Obs.: o Next 16 mantém a página anterior escondida no DOM após navegar (Activity) — nos testes, contar só elementos visíveis.

## Fase 3 — Produto ✅
- [x] Rota `/produtos/[slug]` (produtos de exemplo pré-gerados; criados no admin funcionam na 1ª visita) com `<Suspense>`
- [x] Galeria com swipe (scroll-snap), miniaturas, contador, "Ampliar foto" com zoom (botões + pinça)
- [x] Régua em cm sobreposta (eixos H/V escalados pelo tamanho renderizado × `pixelsPorCm`) + desenho e legenda das medidas; botão "Mostrar/Ocultar régua"
- [x] Cores com amostra (troca a foto); personalizações em botões grandes com acréscimo por m²
- [x] Prazo junto do preço (pronta entrega / produção em X dias úteis)
- [x] Calculadora: várias paredes, portas/janelas com medidas sugeridas, desenho SVG proporcional, validação simples, vírgula ou ponto, explicação da sobra
- [x] Guia "Como medir sua parede?" (3 passos ilustrados + visita técnica pelo WhatsApp)
- [x] CEP: região atendida (aplicação Sim/Não, visita Sim/Não, deslocamento) ou frete/prazo + aviso; CEP salvo e compartilhado
- [x] Resumo em tempo real: barra fixa no celular (total, Pix, "Ver detalhes", "Adicionar ao carrinho"), card lateral fixo no desktop; totais sem/com aplicação
- [x] Passos numerados com ✓ e "Você está aqui"
- [x] Adicionar ao carrinho (avisa se faltar medida) + "Tirar dúvidas no WhatsApp" com produto, cor, personalização e m²
- [x] Testes Playwright: régua, cor, personalização, cálculo (1 e 2 paredes, janela), CEP região/fora, carrinho, guia, botões não cobertos por elementos fixos
- [x] Ajustes após revisar screenshots: botões da régua quebrando, rótulo cortado na régua, personalização em lista no celular, WhatsApp flutuante escondido no desktop da página de produto (cobria o card lateral), galeria maior, barra "Informe as medidas"
- [x] Commit

## Fase 4 — Carrinho e checkout ✅
- [x] `lib/pedido.ts` (subtotal por item, prazo estimado, mensagem do WhatsApp) + 4 testes Vitest
- [x] Carrinho: itens com cor, personalização, m² + paredes, observação/imagem de IA, aplicação, subtotal; "Editar medidas" (calculadora em diálogo); "Remover" com confirmação; estado vazio
- [x] CEP no carrinho recalcula frete/serviços; aplicação e visita para o pedido todo; resumo com Pix
- [x] Duas formas de finalizar com o mesmo destaque (site / WhatsApp)
- [x] Checkout em 3 passos (Seus dados → Endereço → Pagamento) com indicador "Passo X de 3", validação em linguagem simples (erro some ao corrigir), CEP preenche cidade/UF, Pix/cartão/boleto simulados
- [x] Finalizar pelo WhatsApp: pede o nome, salva o pedido (canal `whatsapp`) e abre `wa.me` com o orçamento completo
- [x] Pedido confirmado: número, prazo estimado, resumo, botão de WhatsApp. O carrinho é esvaziado só aqui (evita piscar "carrinho vazio" e funciona com a página escondida do Next 16)
- [x] Testes Playwright: compra completa no site (edição, região, aplicação, validações, Pix), WhatsApp (texto completo da mensagem), remoção
- [x] Ajustes após screenshots: botões de finalizar com mesma altura, erros que não sumiam ao corrigir, textos quebrando
- [x] Commit

## Fase 5 — IA ✅
- [x] `app/api/simular/route.ts` com AI SDK 6 (`generateImage` + `@ai-sdk/openai`, modelo `gpt-image-1` configurável): edição da amostra ("estampa") ou da foto do cliente com a amostra ("parede")
- [x] Sem `OPENAI_API_KEY` → modo demonstração (espera ~1 s; o navegador gera a prévia via canvas) e a UI funciona igual; aviso discreto "Modo demonstração"
- [x] Validação do pedido (tipos, imagens data URL, tamanho) e limite de 6 simulações por sessão (cookie de sessão httpOnly → 429)
- [x] Passo "Veja antes de comprar" com abas "Personalizar a estampa" (observação + sugestões clicáveis) e "Veja na sua parede" (câmera `capture="environment"` ou galeria)
- [x] Aviso de simulação aproximada visível nas duas abas
- [x] Original × Simulação: empilhado no celular, comparação arrastável (`components/comparacao-slider.tsx`, acessível por teclado) no desktop
- [x] Observação + imagem simulada (comprimida para 480 px JPEG) vão para o carrinho e o pedido (e para a mensagem do WhatsApp)
- [x] Testes Playwright: duas abas, foto, resultado, carrinho, produto sem IA, validação e limite da API
- [x] Commit

Para ativar a IA real: criar `.env.local` com `OPENAI_API_KEY=...` (ver `.env.example`).

## Fase 6 — Trabalhos e contato ✅
- [x] /trabalhos: antes/depois com comparação arrastável (dedo, mouse e teclado), destaques primeiro, filtro por cidade em botões grandes, link para o papel usado, chamada para orçamento no WhatsApp
- [x] /contato: WhatsApp (número formatado), Instagram, endereço, "Atendimento presencial somente com hora marcada" + "Agendar pelo WhatsApp", regiões e taxas, mapa (iframe lazy) + "Abrir no Google Maps"
- [x] Testes Playwright (arrastar, filtros, links, atributos de nova aba) + screenshots revisados
- [x] Commit

## Fase 7 — Admin
- [ ] Painel, produtos (régua por clique), trabalhos, configurações, pedidos

## Fase 8 — Revisão final
- [ ] Fluxos Playwright mobile, axe, revisão visual, Lighthouse mobile

## Pendências / observações
- Valores marcados como fictícios na especificação (aplicação, visita, Pix, deslocamento, frete) precisam ser confirmados com a loja.
