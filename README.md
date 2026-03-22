# Celidone Frontend

Sistema de Locação de Trajes a Rigor - Frontend Electron

## Tecnologias

- **Electron 33+** - Runtime desktop
- **React 18** - Biblioteca de UI
- **TypeScript** - Linguagem
- **Vite** - Bundler
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Zod** - Validação

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

## Princípios Aplicados

- **S** - Single Responsibility (cada módulo tem uma responsabilidade)
- **O** - Open/Closed (extensível sem modificar código existente)
- **L** - Liskov Substitution (interfaces bem definidas)
- **I** - Interface Segregation (contratos focados)
- **D** - Dependency Inversion (dependências de abstrações)

## Como Executar

### Pré-requisitos

- Node.js 18+
- Backend Celidone rodando em http://localhost:8080

### Instalação

```bash
cd celidone-frontend
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

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Iniciar servidor Vite |
| `npm run dev:electron` | Iniciar com Electron |
| `npm run build` | Build de produção |
| `npm run build:vite` | Apenas build Vite |
| `npm run lint` | Verificar código |
| `npm run typecheck` | Verificar tipos |

## Configuração da API

O backend padrão está configurado em `http://localhost:8080/api`.

Para alterar, modifique a constante `API_BASE_URL` em:
`src/infraestrutura/api/ClienteApiRepositorio.ts`
