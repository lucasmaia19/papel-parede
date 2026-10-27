import { defineConfig, devices } from "@playwright/test"

// PORTA_TESTES permite rodar em paralelo com outro servidor já aberto na 3100
const PORTA = Number(process.env.PORTA_TESTES ?? 3100)

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/.resultados",
  fullyParallel: true,
  retries: 0,
  // Com vários testes em paralelo o build de produção fica mais lento: 10 s por asserção
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } },
    },
    {
      name: "mobile-390",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "mobile-430",
      use: { ...devices["Pixel 5"], viewport: { width: 430, height: 932 } },
    },
    {
      name: "desktop-1280",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  // Roda contra o build de produção: `npm run build` antes
  webServer: {
    command: `npx next start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
