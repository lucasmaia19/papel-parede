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

## Fase 4 — Carrinho e checkout
- [ ] Carrinho, checkout 3 passos, finalizar pelo WhatsApp, pedido confirmado

## Fase 5 — IA
- [ ] /api/simular com mock, duas abas, comparação, integração com carrinho

## Fase 6 — Trabalhos e contato
- [ ] /trabalhos com slider e filtro, /contato com mapa

## Fase 7 — Admin
- [ ] Painel, produtos (régua por clique), trabalhos, configurações, pedidos

## Fase 8 — Revisão final
- [ ] Fluxos Playwright mobile, axe, revisão visual, Lighthouse mobile

## Pendências / observações
- Valores marcados como fictícios na especificação (aplicação, visita, Pix, deslocamento, frete) precisam ser confirmados com a loja.
