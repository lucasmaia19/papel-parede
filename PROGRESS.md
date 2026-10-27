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

## Fase 7 — Admin ✅
- [x] Layout próprio do admin com o aviso fixo de protótipo em todas as páginas, menu (gaveta no celular), "Ver loja", alerta se o navegador ficar sem espaço
- [x] Painel: números (à venda, cadastrados, pedidos novos, via WhatsApp), atalhos, "Restaurar dados de exemplo" com confirmação
- [x] Produtos: cards com foto, preço/m², selos; busca; Editar, Duplicar, Ativar/Desativar, Excluir (com confirmação)
- [x] Cadastro/edição: dados básicos (slug automático e único), fotos (upload múltiplo redimensionado em base64, subir/descer, principal, remover), cores (nome, seletor, foto da variação), personalizações (grupos e opções com acréscimo, reordenar), régua por 2 cliques + medidas + pré-visualização igual à do cliente, IA (liga/desliga + sugestões), rodapé fixo com "Ver como o cliente vê" e "Salvar", validação com mensagens claras
- [x] `?previa=1` mostra produto desativado na loja (com aviso de pré-visualização)
- [x] Trabalhos: CRUD em diálogo (título, cidade, antes/depois, papel usado, destaque) + reordenar
- [x] Configurações: todos os campos de Settings (preços, serviços, %, cidades com faixas de CEP, frete por região, frete grátis, contatos)
- [x] Pedidos: filtros por status e canal, status editável, detalhes (itens, m², cor, personalização, observação/imagem de IA, serviços, frete/deslocamento, desconto, pagamento, endereço), "Chamar no WhatsApp"
- [x] `lib/admin-produto.ts` e `lib/admin-settings.ts` com 10 testes Vitest (ida e volta pelos formulários, validações, calibração)
- [x] Testes Playwright de todas as telas + reflexo na loja (produto novo, desativado, trabalho novo, configurações mudando preços)
- [x] Ajustes: mensagem "salvo" sumia ao criar produto (agora troca a URL sem remontar), `usePathname` em Suspense (Cache Components), botões de foto apertados em 360px
- [x] Commit

## Fase 8 — Revisão final ✅
- [x] Suíte completa: 41 testes Vitest + 115 testes Playwright (360/390/430/1280) passando
- [x] Acessibilidade com axe (WCAG 2.2 AA) em 13 páginas da loja e do admin, celular e desktop: 0 violações
  - corrigido: galeria de fotos (área com rolagem) agora focável pelo teclado; hierarquia de títulos no catálogo
- [x] Lighthouse mobile (build de produção):

  | Página | Performance | Acessibilidade | Boas práticas | SEO |
  |---|---|---|---|---|
  | / | 92 | 100 | 100 | 100 |
  | /produtos | 92 | 100 | 100 | 100 |
  | /pronta-entrega | 93 | 100 | 100 | 100 |
  | /produtos/xadrez-vichy | 92 | 100 | 100 | 100 |
  | /carrinho | 90 | 100 | 100 | 100 |
  | /trabalhos | 92 | 100 | 100 | 100 |
  | /contato | 94 | 100 | 100 | 100 |

  - corrigido: página de produto saía do HTML estático (id aleatório na pré-renderização e `searchParams`) → CLS 0,24 → 0,01 e performance 79 → 92
  - corrigido: catálogo agora vem completo no HTML (fallback do Suspense é o próprio catálogo sem filtros)
- [x] Revisão visual por screenshots de todas as telas
- [x] README com como rodar, testar e ativar a IA
- [x] Commit

## Ajustes de feedback do cliente (rodada 1)

- [x] 1. Nova direção visual delicada e pastel — loja e admin
  - Tokens novos em `app/globals.css` (creme, taupe, rosé, sálvia, azul acinzentado; sombras taupe quase invisíveis; overlay taupe; cantos 8px); fontes Cormorant Garamond + Jost (300–500); ícones lucide com traço 1,4; logo em serifada fina
  - Pesos: títulos 400, nada acima de 500 no site todo
  - Desenhos técnicos (parede, guia de medição, régua, calibração) e imagens de exemplo sem preto/branco; busca por `#000/#111/#fff/black/white` no código: 0 ocorrências
  - Contraste: o rosé do exemplo `#A88679` dava só 3,1:1 com texto creme → botão principal `#8B6A5E` (4,56:1); WhatsApp `#7FB89A` daria 2,1:1 com ícone creme → `#5E9C7C` (3:1, mínimo para ícone); textos sobre rosé claro em `#7A5B50` (5:1)
  - Botões de WhatsApp com texto já passaram ao estilo secundário (exigência de contraste; previsto no item 5)
  - Números do painel do admin em Jost fina (o "1" da Cormorant parece "I")
  - Verificação: lint, tsc, build, 41 Vitest, 115 Playwright (inclui axe sem violações) + screenshots revisados
- [x] 2. Texto da pronta entrega
  - Home, /pronta-entrega (texto e descrição da página) e /produtos: "Linho com textura nas cores branco e off-white (sem estampa), já na loja e com envio imediato."
  - Seeds: pronta entrega = "Linho texturizado Branco" e "Linho texturizado Off-white" (um produto por cor, sem estampa); o "Texturizado Palha" saiu dos dados de exemplo e o "Liso Fosco" virou sob encomenda (5 dias úteis). O catálogo continua com 12 produtos
  - Imagens regeneradas; busca por "texturizados e lisos": 0 ocorrências
  - Verificação: lint, tsc, build, 41 Vitest, 115 Playwright + screenshot da pronta entrega revisado
- [x] 3. Régua fora da imagem
  - Novo `components/produto/regua-imagem.tsx`: foto limpa em tamanho natural (sem corte, escala exata) com régua horizontal acima e vertical à esquerda; cota da medida principal destacada nas réguas (rótulo "10 cm" fora da foto, ao lado do trecho quando ele é estreito); legenda "Cada quadrado mede 10 cm x 10 cm" (ou "Cada listra mede 5 cm de largura")
  - Régua oculta = carrossel em largura total; o antigo overlay sobre a foto foi removido; o preview do admin usa a mesma galeria
  - Teste Playwright: nenhum elemento da régua com interseção sobre a foto, réguas fora dos limites da foto, escala (cota de 10 cm = 1/6 da amostra de 60 cm, nos dois eixos), régua oculta = largura total
  - Números da régua 13px e cotas 14px (legíveis em 360px); conferido em xadrez, listrado e borboletas
  - Playwright: tempo de espera das asserções 10 s (a suíte paralela no build de produção ficou mais lenta e um teste oscilou)
  - Verificação: lint, tsc, build, 41 Vitest, 115 Playwright + screenshots revisados
- [x] 4. Material por produto (Texturizado linho / Adesivo liso)
  - Modelo: `Product.materiais: { id, nome, descricao, precoM2, ativo }[]`; `precoM2` do produto = menor preço entre os ativos ("a partir de"); `CartItem.material`
  - `lib/materiais.ts` (padrões, ativos, "a partir de", migração) e `precoM2DoItem` em `lib/pricing.ts` + testes (preço por material, estimativa sem material, total mudando ao trocar)
  - Página do produto: passo "Escolha o material" logo após a cor, dois botões grandes lado a lado (nome, descrição de uma linha, preço/m²); obrigatório (mensagem no seletor, rola até ele); o linho sem estampa já vem com o único material escolhido
  - Material no carrinho, checkout, confirmação, "Finalizar pelo WhatsApp", "Tirar dúvidas no WhatsApp" e pedidos do admin
  - Admin: seção "Materiais" (ativar/desativar, nome, descrição, preço/m², adicionar, remover; ao menos um ativo); "Preço por m²" saiu dos dados básicos
  - Store persist v2 (migração adiciona materiais a produtos antigos salvos no navegador)
  - Junto neste commit, da sessão paralela papel-parede-be (pedido do usuário): seeds trocados pelas fotos reais de `papel-fotos/` (13 produtos .webp, 1 cor cada, régua só no Xadrez 3 cm com 10,667 px/cm ⚠️ estimado; 1 trabalho realizado sem foto de antes), `scripts/importar-fotos.mjs`, store v3 (recarrega os seeds no navegador) e testes adaptados aos slugs novos — corrigi 4 desses testes que não tinham rodado
  - Infra: `NEXT_DIST_DIR` (build separado por sessão) e `PORTA_TESTES` no Playwright, para várias sessões testarem ao mesmo tempo sem pisar no `.next` nem na porta 3100
  - Verificação: lint, tsc, 45 Vitest, build, 131 Playwright (4 larguras, inclui axe)
  - ⚠️ Ponto aberto: o texto da pronta entrega diz "branco e off-white", mas os seeds novos só têm o linho off-white
- [ ] 5. WhatsApp flutuante só ícone (52px, verde suave), sem sobrepor clicáveis (teste de interseção); demais botões de WhatsApp no estilo secundário
- [ ] CLAUDE.md atualizado (direção visual, modelo de dados, página do produto)

## Pendências / observações
- Valores marcados como fictícios na especificação (aplicação, visita, Pix, deslocamento, frete) precisam ser confirmados com a loja — todos editáveis em /admin/configuracoes.
- Regras de cálculo adotadas (ver Fase 1) devem ser validadas com a loja.
- Fotos de exemplo são ilustrações SVG; trocar por fotos reais pelo admin.
- Sem backend/login nesta etapa: dados ficam no navegador de quem usa. O admin precisa de login e banco no sistema final.
- Pagamento é simulado. A IA real precisa de `OPENAI_API_KEY` (há custo por imagem gerada).
- localStorage tem ~5 MB: muitas fotos grandes enviadas pelo admin podem encher (o admin avisa).
