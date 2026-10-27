# Rodovalho Papéis de Parede — protótipo de e-commerce

Loja (celular primeiro) e área administrativa para a Rodovalho Papéis de Parede, de Uberlândia-MG.
A especificação completa está em `CLAUDE.md` e o andamento em `PROGRESS.md`.

## Rodar

```bash
npm install
npm run dev            # http://localhost:3000  (admin em /admin)
```

Sem backend: os dados de exemplo estão em `lib/data.ts`, e tudo o que o admin altera fica salvo
no navegador (localStorage) e aparece na loja na hora. "Restaurar dados de exemplo" fica no painel do admin.

### Simulação com IA

Funciona sem configuração, em **modo demonstração**. Para usar a IA de verdade (OpenAI `gpt-image-1`
via AI SDK), crie `.env.local`:

```
OPENAI_API_KEY=sk-...
```

## Testes

```bash
npm test               # Vitest: preços, CEP, pedido, formulários do admin
npm run build          # obrigatório antes dos testes de interface
npm run test:e2e       # Playwright em 360, 390, 430 e 1280 px + acessibilidade (axe)
```

Os screenshots ficam em `tests/screenshots/`. Para revisar um screenshot longo:
`node scripts/fatiar-screenshot.mjs <arquivo.png> <pasta>`.

As imagens de exemplo (SVG) são geradas por `npm run gerar:imagens`.

## Estrutura

- `app/(loja)` — páginas da loja; `app/admin` — área administrativa; `app/api/simular` — simulação com IA
- `lib/pricing.ts` — todas as regras de preço (funções puras, testadas)
- `lib/cep.ts` — CEP → UF → região, cidades atendidas por faixa de CEP
- `lib/store.ts` — store Zustand persistido (a fonte de verdade)
- `components/ui` — componentes shadcn (Base UI) customizados para o tema
