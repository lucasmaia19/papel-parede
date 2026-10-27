# Rodovalho Papéis de Parede — E-commerce

Este arquivo é a especificação do projeto. Leia inteiro antes de qualquer tarefa e siga as REGRAS DE TRABALHO.

## REGRAS DE TRABALHO (obrigatórias)

1. **Trabalhe por fases** (ver "Plano de fases" no fim). Não comece uma fase sem terminar e validar a anterior.
2. **Antes de codar uma fase**, liste o que será feito e marque os itens no `PROGRESS.md` (crie se não existir) como checklist.
3. **Ao terminar cada fase**, rode obrigatoriamente:
   - `npm run lint` e `npx tsc --noEmit` — zero erros.
   - `npm run build` — tem que passar.
   - Testes de fluxo com Playwright (`tests/`) nas larguras **360px, 390px e 430px** (mobile) e 1280px (desktop): sem rolagem horizontal, sem elemento cortado, botões ≥ 48px, barra de preço fixa não cobrindo botões.
   - Tire screenshots (`tests/screenshots/`) das páginas da fase no mobile, **abra e olhe** para conferir o visual.
   - Atualize o `PROGRESS.md` marcando o que foi concluído e anotando o que ficou pendente.
4. **Nunca marque algo como pronto sem testar.** Se um teste falhar, corrija antes de seguir.
5. **Mobile-first de verdade:** escreva primeiro o CSS do celular; desktop é ajuste com breakpoints `md:`/`lg:`.
6. Lógica de preço em funções puras em `lib/pricing.ts`, com testes unitários (Vitest) cobrindo: m² com várias paredes, desconto de portas/janelas, margem de perda, acréscimo de personalização, aplicação, visita, deslocamento, frete por região, frete grátis, desconto Pix.
7. Commits pequenos ao fim de cada fase, com mensagem clara.

---

## VISÃO GERAL

E-commerce de papel de parede para a **Rodovalho Papéis de Parede**, de Uberlândia-MG, com loja para o cliente e área administrativa. Todo em português do Brasil, preços em R$ (formatar com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).

A loja vende para todo o Brasil (com frete) e oferece aplicação e visita técnica apenas em Uberlândia e região.

**Stack:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui (customizado), Zustand com `persist` em localStorage, Vitest, Playwright.

**Sem backend nesta etapa:** dados iniciais em `lib/data.ts`; o store global é a fonte de verdade. Tudo que o admin cadastrar ou alterar aparece na hora na loja. Cuidado com hydration: só ler o store persistido no cliente.

---

## 1. PÚBLICO, CELULAR E USABILIDADE (prioridade máxima)

- A maioria dos clientes acessa pelo **celular**. Testar em 360–430px; desktop é secundário.
- Uma pessoa de **70 anos** precisa conseguir usar sem ajuda: fonte base 18px+, contraste WCAG AA, botões ≥ 48px com texto (nunca só ícone), linguagem simples.
- Poucos elementos por tela, fluxos guiados passo a passo com indicação de "você está aqui".
- Nada de rolagem horizontal ou tabelas largas; no celular use cards.
- Campos numéricos com `inputmode="decimal"`, aceitando vírgula ou ponto.

## 1.1 DIREÇÃO VISUAL (evitar cara de "site feito por IA")

**Não usar:**
- Gradientes roxo/azul, glassmorphism, brilhos, blobs, fundos escuros "tech", neon.
- Hero genérico ("Transforme seu espaço" + dois botões + mockup flutuante).
- Grade de "3 cards de benefícios com ícone", emojis decorativos, ícones em círculos coloridos.
- Visual padrão do shadcn sem customização (sombras em tudo, cinza-azulado), preto/branco puro, verde escuro, fontes pesadas.
- Animações chamativas (só transições curtas e sutis).

**Fazer:** estética delicada e afetiva, de loja de decoração (referência: lojas de decoração infantil/afetiva, visual leve e aconchegante).
- A foto é a protagonista: imagens grandes, com bastante respiro, pouco texto sobre elas, sombras quase invisíveis ou nenhuma.
- **Nada de preto ou branco puro** em lugar nenhum (textos, ícones, régua, bordas, botões, overlays). Tudo em variáveis CSS (`app/globals.css`):
  - Fundo creme `#FBF7F3`; superfícies secundárias bege-rosado `#F4ECE6`; cards/campos `#FFFCF9`.
  - Texto taupe: títulos `#7A6359`, corpo `#6B5A52`, secundário `#7A6359`. Contraste mínimo 4,5:1 (público de 70 anos) — conferir ao mudar qualquer tom.
  - Destaque rosé/terracota suave: botão principal `#8B6A5E` com texto creme (é o tom mais claro que mantém 4,5:1), decorativo `#C9A396`; apoio em sálvia clara `#E1E8DC` e azul acinzentado `#DFE6EC`. Texto sobre rosé claro usa `#7A5B50`.
  - Bordas finas bege `#E8DCD3`; borda de campos `#9C877C` (≥ 3:1); overlay de diálogos em taupe translúcido.
- Tipografia fina e delicada, tamanho base 18px (fino não é pequeno):
  - Títulos: Cormorant Garamond 300/400, generosos, algarismos alinhados.
  - Texto e botões: Jost 300/400; no máximo 500 para preço e botões. Nunca bold pesado.
  - Logo "Rodovalho" em serifada fina + "PAPÉIS DE PAREDE" em caixa alta espaçada, taupe.
- Ícones de traço fino (stroke 1,25–1,5) no tom taupe.
- Botão principal: fundo rosé-taupe, texto creme, cantos levemente arredondados (8px). Secundário: borda fina taupe, texto taupe, fundo creme. Botões de WhatsApp: estilo secundário com ícone verde suave (sem verde forte).
- Linhas divisórias finas em bege, muito espaço em branco, grid simples.
- Cards de produto minimalistas: foto grande, nome, "R$ 80,00/m²". Amostras de cor como quadrados de papel com borda fina.
- Deve parecer uma loja de decoração de confiança, artesanal e acolhedora — não uma startup de tecnologia.

---

## 2. MODELO DE DADOS (`types/index.ts`)

**Product:** id, slug, nome, descricao, categoria (`estampado | listrado | quadriculado | floral | infantil | texturizado | liso`), imagens (ordenadas, com principal), precoM2 (padrão 80), prontaEntrega, prazoProducaoDias, ativo, cores (`{nome, hex, imagem}`), gruposPersonalizacao (`{nome, opcoes: {rotulo, acrescimoM2?}[]}`), regua (`{pixelsPorCm, medidas: {rotulo, larguraCm, alturaCm}[]}`), iaHabilitada, sugestoesIA (string[]).

**Settings:**
- precoM2Padrao: 80
- valorAplicacaoM2: 25 ⚠️ fictício
- valorVisitaMedicao: 50 ⚠️
- margemPerda: 10 (%)
- descontoPix: 5 (%) ⚠️
- cidadesAtendidas: Uberlândia 0, Araguari 60, Uberaba 90 ⚠️ (cidades com aplicação/medição)
- tabelaFrete por região (simulada) — `{regiao, valor, prazoDias}`: MG 30/3, Sudeste 45/5, Sul 60/7, Centro-Oeste 55/6, Nordeste 75/9, Norte 90/12 ⚠️
- freteGratisAcimaDe: 1000 ⚠️ (opcional)
- whatsapp: `5534996804044` — exibir `(34) 9 9680-4044`
- instagram: `https://www.instagram.com/rodovalhopapeisdeparede/`
- endereco: R. José Joaquim Francisco, 229 - Vigilato Pereira, Uberlândia - MG, 38408-610
- textoAtendimento: "Atendimento presencial somente com hora marcada"

**Order:** cliente, endereço, itens (produto, cor, personalizações, m², paredes, observação de IA + imagem simulada, serviços, subtotal), modalidade (entrega via frete | aplicação na região), frete ou deslocamento, desconto Pix, total, formaPagamento, canal (`site | whatsapp`), status, data.

**WorkGallery:** id, titulo, cidade, fotoAntes, fotoDepois, produtoId?, destaque.

**Seeds:** ~12 produtos (listrado azul/rosa, quadriculado, borboletas, floral, infantil, "Linho texturizado Branco" e "Linho texturizado Off-white", sem estampa, como os únicos de pronta entrega) e 4 trabalhos na galeria. Imagens placeholder locais em `public/` (padrões gerados em SVG, sem depender de serviço externo).

Busca de CEP simulada: mapear faixa de CEP → UF → região; tratar Uberlândia (384xx), Araguari (3844x) e Uberaba (380xx–381xx) como cidades atendidas.

---

## 3. LOJA (CLIENTE)

**Páginas:**
- **Home:** foto grande de ambiente; chamadas "Calcule seu papel de parede", "Veja na sua parede" e "Pronta entrega"; categorias; destaques; trechos da galeria; faixa "Enviamos para todo o Brasil • Aplicamos em Uberlândia, Araguari, Uberaba e região".
- **Catálogo** `/produtos`: filtros por categoria e cor com botões grandes (no celular, em gaveta/sheet).
- **Pronta Entrega** `/pronta-entrega` (aba no menu): produtos de envio imediato. Texto padrão: "Linho com textura nas cores branco e off-white (sem estampa), já na loja e com envio imediato." (usar também na chamada da home).
- **Produto** `/produtos/[slug]` (ver abaixo).
- **Trabalhos realizados** `/trabalhos`: antes/depois com slider de comparação arrastável e filtro por cidade.
- **Carrinho**, **Checkout**, **Pedido confirmado**.
- **Contato** `/contato`.

### Página do produto

a) **Galeria** com swipe e zoom por toque. **Régua** sobreposta (eixos horizontal e vertical em cm, usando `pixelsPorCm`, escalando conforme o tamanho renderizado da imagem) + marcações das medidas do elemento ("cada quadrado: 10 cm x 10 cm"). Botão grande "Mostrar/ocultar régua". Legível no celular.

b) **Cor:** botões grandes com amostra e nome; a foto troca ao selecionar.

c) **Personalizações fixas** cadastradas no admin (largura da listra 3/5/8 cm, tamanho do quadrado 5/10/15 cm, estampa P/M/G), em botões grandes.

d) **Prazo** perto do preço: "Pronta entrega — envio imediato" ou "Produção em X dias úteis + entrega".

e) **Calculadora de m²**, em etapas:
- "+ Adicionar parede": largura e altura em metros, com desenho SVG da parede que muda de proporção enquanto o cliente digita.
- Descontar portas e janelas.
- Área total + margem de perda, com explicação simples.
- Preço do papel = m² × preço/m² (+ acréscimos de personalização).
- Botão "Como medir sua parede?" abrindo um guia ilustrado (SVG) em 3 passos: largura de ponta a ponta; altura do chão ao teto; anotar portas e janelas. No final: "Ficou com dúvida? Em Uberlândia e região fazemos a visita técnica para medir para você" + botão de WhatsApp.

f) **Entrega ou aplicação (pelo CEP):**
- Campo grande "Digite seu CEP".
- Cidade atendida → opções "Quero aplicação" Sim/Não (por m²), "Quero visita técnica para conferir as medidas" Sim/Não e taxa de deslocamento.
- Outra cidade/UF → frete e prazo pela tabela (ou "Frete grátis" acima do valor) + aviso: "Aplicação e visita técnica disponíveis apenas em Uberlândia e região. Enviamos o papel com instruções de aplicação."

g) **Simulação com IA** (se habilitada), duas abas:
1. **"Personalizar a estampa":** observação com sugestões clicáveis ("Trocar a cor das borboletas para lilás", "Substituir as borboletas por pássaros"). Botão "Ver simulação".
2. **"Veja na sua parede":** foto da parede pela câmera (`capture="environment"`) ou galeria; a IA aplica o papel escolhido (cor + personalização). Botão "Ver na minha parede".
- Implementação: rota `app/api/simular/route.ts` usando o AI SDK com modelo de edição de imagem. Se não houver chave de API em `.env`, retornar mock (delay + imagem de exemplo) — a UI funciona igual. Limite simples de simulações por sessão.
- Mostrar Original × Simulação com slider de comparação (empilhado no celular).
- Aviso visível nas duas abas: *"Esta é uma simulação aproximada feita por inteligência artificial, apenas para dar uma ideia de como ficaria. O resultado final pode variar. Nossa equipe confirma tudo antes da produção."*
- Observação e imagem simulada vão para o carrinho e o pedido (comprimir a imagem antes de salvar no localStorage).

h) **Resumo de preço em tempo real** — barra fixa no rodapé no celular (TOTAL sempre visível, botão para expandir detalhes); card lateral fixo no desktop:
- Papel (X m² × R$ …)
- Aplicação (ou "Não incluída") — só na região
- Visita de medição — só na região
- Deslocamento ou Frete
- **TOTAL**
- "No Pix: R$ … (X% de desconto)"
- Na região: "Total sem aplicação" e "Total com aplicação" lado a lado.

i) Botões "Adicionar ao carrinho" e "Tirar dúvidas no WhatsApp" (mensagem com produto, cor, metragem).

### Carrinho e checkout

- Carrinho com itens detalhados (cor, personalização, m², observação/imagem de IA, serviços, subtotal), editar/remover, resumo com frete/deslocamento e desconto Pix.
- Duas formas de finalizar, mesmo destaque:
  1. **Finalizar compra no site:** 3 passos — Seus dados; Endereço (CEP recalcula frete/serviços); Pagamento (Pix com desconto, cartão, boleto — simulado).
  2. **Finalizar pelo WhatsApp:** abre `https://wa.me/5534996804044?text=...` com o orçamento completo formatado (itens, cor, personalização, m², observação de IA, serviços, cidade/CEP, frete ou deslocamento, total e total no Pix), via `encodeURIComponent`. Salva o pedido com canal `whatsapp`.
- Pedido confirmado: resumo, prazo estimado, botão de WhatsApp.

### Rodapé / contato (todas as páginas)

- **WhatsApp** `(34) 9 9680-4044`: número e todos os ícones/botões (flutuante, rodapé, dúvidas, agendar, finalizar, pedido confirmado) são links para `https://wa.me/5534996804044`, `target="_blank" rel="noopener noreferrer"`, com `?text=` quando houver contexto.
- **Instagram:** ícone + "@rodovalhopapeisdeparede" linkando para `https://www.instagram.com/rodovalhopapeisdeparede/` (nova aba). Ao lado do WhatsApp no rodapé, no menu mobile e em /contato.
- Botão flutuante de WhatsApp que **não cobre** a barra de preço nem o botão de compra no celular.
- Endereço + mapa via iframe `https://www.google.com/maps?q=R.+José+Joaquim+Francisco,+229,+Vigilato+Pereira,+Uberlândia,+MG&output=embed` (lazy) + botão "Abrir no Google Maps".
- "Atendimento presencial somente com hora marcada" + botão "Agendar pelo WhatsApp".
- "Enviamos para todo o Brasil. Aplicamos em Uberlândia e regiões próximas, como Araguari e Uberaba" + taxas de deslocamento.

---

## 4. ÁREA ADMINISTRATIVA (`/admin`)

Sem login por enquanto. Aviso fixo no topo de todas as páginas do admin:
> ⚠️ Área administrativa — no sistema final esta tela será acessível apenas pelo administrador, com login. Nesta versão de protótipo ela está aberta.

Responsivo e usável no celular, mesmo padrão visual. Botão "Restaurar dados de exemplo".

- **Painel** `/admin`: atalhos (Papéis de parede, Trabalhos realizados, Configurações, Pedidos) e números (produtos, pedidos novos, pedidos via WhatsApp).
- **Produtos** `/admin/produtos`: cards com foto, nome, preço/m², selo "Pronta entrega"; busca; Editar, Duplicar, Ativar/Desativar, Excluir (com confirmação).
- **Cadastro/edição** `/admin/produtos/novo` e `/admin/produtos/[id]`:
  a) Dados básicos: nome, descrição, categoria, preço/m², pronta entrega, prazo de produção, ativo.
  b) Fotos: upload múltiplo (redimensionar e salvar em base64), reordenar, definir principal.
  c) Cores: nome, seletor, foto da variação.
  d) Personalizações: grupos com opções e acréscimo opcional por m²; adicionar, editar, remover, reordenar.
  e) Régua: clicar em dois pontos da foto e informar os cm entre eles → calcula `pixelsPorCm`; cadastrar medidas do elemento; preview igual ao do cliente.
  f) IA: habilitar/desabilitar e sugestões de observação.
  g) "Ver como o cliente vê" e "Salvar" fixo no rodapé no celular. Validação com mensagens claras.
- **Trabalhos** `/admin/trabalhos`: CRUD + reordenar (título, cidade, antes, depois, produto relacionado, destaque).
- **Configurações** `/admin/configuracoes`: todos os campos de Settings. Tudo reflete na loja.
- **Pedidos** `/admin/pedidos`: cliente, cidade/UF, canal, itens, m², cor, personalização, observação e imagem de IA, serviços, frete/deslocamento, desconto, total, status editável (Novo, Medição agendada, Em produção, Enviado, Aplicado, Concluído). Filtros por status e canal. "Chamar no WhatsApp".

---

## PLANO DE FASES

1. **Base:** projeto, tema visual (tokens, fontes, componentes base customizados), layout (header com menu mobile, rodapé, WhatsApp flutuante, Instagram), tipos, seeds, store com persist, `lib/pricing.ts` + testes.
2. **Catálogo:** home, /produtos, /pronta-entrega, cards.
3. **Produto:** galeria + régua, cores, personalizações, calculadora + guia "Como medir", CEP/entrega/serviços, resumo de preço.
4. **Carrinho e checkout:** carrinho, checkout em 3 passos, finalizar pelo WhatsApp, pedido confirmado.
5. **IA:** rota /api/simular com mock, as duas abas, comparação, integração com carrinho.
6. **Trabalhos e contato:** /trabalhos com slider, /contato com mapa.
7. **Admin:** painel, produtos (com régua por clique), trabalhos, configurações, pedidos.
8. **Revisão final:** passar todos os fluxos no Playwright no mobile, acessibilidade (axe), revisão visual por screenshots, Lighthouse mobile.
