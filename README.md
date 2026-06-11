# TCC Frontend

Sistema de Locação de Trajes a Rigor — Frontend Electron/Web.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura-clean-architecture)
- [Princípios Aplicados](#princípios-aplicados)
- [Como Executar](#como-executar)
- [Testes](#testes)
- [Qualidade de Código](#qualidade-de-código)
- [CI/CD](#cicd)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Configuração da API](#configuração-da-api)

---

## Funcionalidades

Três domínios principais, todos com CRUD completo, filtros e paginação:

- **Clientes** — cadastro, edição, listagem com busca, exclusão lógica e recuperação, busca de CEP via viaCEP, registro de medidas masculinas/femininas.
- **Trajes** — cadastro/edição com upload de imagem, listagem com filtros (tipo, cor, tamanho, status), calendário de disponibilidade.
- **Aluguéis** — criação com selecionador de trajes (foto + disponibilidade), listagem com filtros (status, cliente, datas, ocasião), edição, **registro de devolução** com condição por traje, **geração de contrato em PDF** (abre em nova aba) e exclusão.

---

## Tecnologias

- **Electron 33+** — runtime desktop (também roda no navegador via Vite)
- **React 18** + **TypeScript 5**
- **Vite 6** — bundler e dev server
- **React Router 6** — roteamento
- **React Bootstrap** + **Bootstrap 5** — UI
- **Axios** — cliente HTTP
- **Zod** — validação de schemas
- **lucide-react** — ícones
- **electron-log** — logging

---

## Arquitetura (Clean Architecture)

```
src/
├── domain/                      # Camada interna (regras de negócio puras)
│   ├── entidades/               # Models (Cliente, Aluguel, Traje, etc.)
│   ├── interfaces/              # Contratos dos repositórios
│   └── erros/                   # Erros de domínio (FalhaConexao, RecursoNaoEncontrado, …)
│
├── application/                 # Casos de uso (orquestração)
│   ├── alugueis/                # Criar, Listar, Editar, Devolver, GerarContrato, …
│   ├── clientes/                # Cadastrar, Editar, Excluir, Recuperar, BuscarCep, …
│   └── trajes/                  # CRUD + Disponibilidade
│
├── infrastructure/              # Implementações externas
│   └── api/                     # Repositórios Axios (Aluguel, Cliente, Traje, Enum)
│
├── interfaces-graficas/         # Camada externa (UI)
│   ├── componentes/             # Botão, Card, Tabela, Modal, Calendário, Layout, …
│   ├── paginas/                 # alugueis/, clientes/, trajes/, dashboard/
│   └── utils/                   # Helpers de formatação, alias de enums
│
├── App.tsx                      # Setup das rotas
└── main.tsx                     # Entry point Vite/React
```

A regra é: **dependências apontam de fora para dentro**. `interfaces-graficas` depende de `application`, que depende de `domain`. `infrastructure` implementa interfaces de `domain` e é injetada pelas páginas.

---

## Princípios Aplicados

- **S** — Single Responsibility (cada use case faz uma coisa só)
- **O** — Open/Closed (novos casos de uso sem alterar repositórios)
- **L** — Liskov Substitution (qualquer implementação de `IAluguelRepository` funciona nos use cases)
- **I** — Interface Segregation (contratos focados por domínio)
- **D** — Dependency Inversion (use cases dependem de interfaces, não de Axios)

---

## Como Executar

### Pré-requisitos

- Node.js 18+
- Backend TCC rodando em `http://localhost:8080`

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
# Web (Vite, abre em http://localhost:5173)
npm run dev

# Desktop (Electron)
npm run dev:electron
```

### Build

```bash
# Build completo (Vite + Electron Builder)
npm run build

# Apenas Vite (web)
npm run build:vite
```

O instalador desktop é gerado em `release/`.

---

## Testes

Stack: **Jest** + **React Testing Library** + **jest-environment-jsdom**.

```bash
npm run test            # roda todos
npm run test:watch      # modo watch
npm run test:coverage   # coverage em coverage/
```

### Configuração

- `jest.config.cjs` — configuração principal (transforms, moduleNameMapper, setup)
- `src/setupTests.ts` — extensões `@testing-library/jest-dom`
- `src/__mocks__/` — mocks de assets estáticos (CSS, imagens)

### Cobertura

Threshold mínimo de **50%**. Casos de uso (`application/`) e repositórios (`infrastructure/api/`) têm cobertura próxima de 100%.

---

## Qualidade de Código

### ESLint

```bash
npm run lint            # checagem
npm run lint:fix        # autofix
```

Plugins ativos: `@typescript-eslint`, `react`, `react-hooks`, `react-refresh`, `jsx-a11y`, `prettier`.

### Prettier

```bash
npm run prettier        # formata src/**
npm run prettier:check  # apenas verifica
```

### TypeScript

```bash
npm run typecheck       # tsc --noEmit
```

---

## CI/CD

Workflows do GitHub Actions em `.github/workflows/`:

| Workflow | Etapas |
|----------|--------|
| `ci.yml` | Lint → typecheck → testes com coverage → build Vite → build Electron |
| `code-quality.yml` | ESLint + TypeScript |

**Executores:** Ubuntu latest, Node 20, com cache de `node_modules`.

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server Vite |
| `npm run dev:electron` | Dev server + Electron |
| `npm run build` | Build de produção (Vite + Electron Builder) |
| `npm run build:vite` | Apenas build web |
| `npm run preview` | Preview do build Vite |
| `npm run electron` | Roda Electron contra o build atual |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` / `test:watch` / `test:coverage` | Jest |
| `npm run prettier` / `prettier:check` | Prettier |

---

## Estrutura de Diretórios do Electron

```
electron/
├── main.ts         # Processo principal (main process)
└── preload.ts      # Bridge IPC seguro (preload script)
```

### Segurança

- `contextIsolation: true` — isolamento de contexto
- `nodeIntegration: false` — sem acesso direto ao Node.js
- `sandbox: true` — renderer em sandbox
- `contextBridge` — exposição segura de APIs

---

## Configuração da API

Por padrão, os repositórios apontam para `http://localhost:8080`. Os arquivos relevantes:

- `src/infrastructure/api/AluguelApiRepository.ts`
- `src/infrastructure/api/ClienteApiRepository.ts`
- `src/infrastructure/api/TrajeApiRepository.ts`
- `src/infrastructure/api/EnumApiRepository.ts`

### Endpoints consumidos (backend)

- `GET/POST/PUT/DELETE /alugueis` + `/alugueis/{id}/devolucao` + `/alugueis/{id}/contrato` (PDF)
- `GET/POST/PUT/DELETE /clientes` + `/clientes/{id}/recuperar`
- `GET/POST/PUT/DELETE /trajes` + `/trajes/{id}/imagem`
- `GET /enums/...` para selects
