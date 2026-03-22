# TCC Frontend

Sistema de Locação de Trajes a Rigor - Frontend Electron

## Sumário

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

## Tecnologias

- **Electron 33+** - Runtime desktop
- **React 18** - Biblioteca de UI
- **TypeScript** - Linguagem
- **Vite** - Bundler
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Zod** - Validação

---

## Arquitetura (Clean Architecture)

```
src/
├── dominio/                    # Camada interna (innermost)
│   ├── entidades/              # Entidades do negócio
│   ├── interfaces/             # Contratos (abstrações)
│   └── erros/                 # Erros de domínio
│
├── aplicacao/                  # Casos de uso
│   └── clientes/              # Operações de cliente
│
├── infraestrutura/             # Implementações externas
│   └── api/                   # Cliente API REST
│
└── interfaces-graficas/        # Camada externa (UI)
    ├── componentes/           # Componentes React reutilizáveis
    ├── contextos/            # React Context (estado global)
    ├── paginas/              # Telas/pages
    └── estilos/              # CSS
```

---

## Princípios Aplicados

- **S** - Single Responsibility (cada módulo tem uma responsabilidade)
- **O** - Open/Closed (extensível sem modificar código existente)
- **L** - Liskov Substitution (interfaces bem definidas)
- **I** - Interface Segregation (contratos focados)
- **D** - Dependency Inversion (dependências de abstrações)

---

## Como Executar

### Pré-requisitos

- Node.js 18+
- Backend TCC rodando em http://localhost:8080

### Instalação

```bash
cd tcc-frontend
npm install
```

### Desenvolvimento

```bash
# Executar frontend React (Vite)
npm run dev

# Executar com Electron
npm run dev:electron
```

### Build

```bash
# Build para produção
npm run build
```

O executável será gerado em `release/`.

---

## Testes

O projeto utiliza **Jest** com **React Testing Library**.

### Executar Testes

```bash
# Executar testes
npm run test

# Executar em modo watch
npm run test:watch

# Executar com coverage
npm run test:coverage
```

### Configuração

- `jest.config.ts` - Configuração principal
- `src/setupTests.ts` - Setup com jest-dom
- `src/__mocks__/` - Mocks para arquivos estáticos

### Cobertura

O projeto possui threshold mínimo de **50%** de cobertura. O relatório é gerado em `coverage/`.

---

## Qualidade de Código

### ESLint

```bash
# Verificar erros
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

### Prettier

```bash
# Formatar código
npm run prettier

# Verificar formatação
npm run prettier:check
```

### TypeScript

```bash
# Verificar tipos
npm run typecheck
```

---

## CI/CD

O projeto possui workflows do GitHub Actions em `.github/workflows/`:

### Pipelines

1. **ci.yml** - Pipeline principal
   - Lint + TypeScript check
   - Testes com coverage
   - Build Vite
   - Build Electron App

2. **code-quality.yml** - Análise de qualidade
   - ESLint
   - TypeScript

### Executores

- Ubuntu latest
- Node.js 20
- Cache de dependências

---

## Estrutura de Diretórios do Electron

```
electron/
├── main.ts         # Processo principal (main process)
└── preload.ts      # Bridge seguro IPC (preload script)
```

### Segurança

- `contextIsolation: true` - Isolamento de contexto
- `nodeIntegration: false` - Sem acesso direto ao Node.js
- `sandbox: true` - Sandboxed renderer
- `contextBridge` - Exposição segura de APIs

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Iniciar servidor Vite |
| `npm run dev:electron` | Iniciar com Electron |
| `npm run build` | Build de produção |
| `npm run build:vite` | Apenas build Vite |
| `npm run lint` | Verificar código |
| `npm run lint:fix` | Corrigir código |
| `npm run typecheck` | Verificar tipos |
| `npm run test` | Executar testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com coverage |
| `npm run prettier` | Formatar código |
| `npm run prettier:check` | Verificar formatação |

---

## Configuração da API

O backend padrão está configurado em `http://localhost:8080/api`.

Para alterar, modifique a constante `API_BASE_URL` em:
`src/infraestrutura/api/ClienteApiRepositorio.ts`