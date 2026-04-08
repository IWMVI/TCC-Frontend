# Arquitetura de Testes — Frontend

## Stack

| Ferramenta | Propósito |
|---|---|
| **Jest** | Framework de teste (runner, assertions, mocks) |
| **ts-jest** | Transpila TypeScript para Jest sem build separado |
| **React Testing Library (RTL)** | Testa componentes pelo comportamento, não pela implementação |
| **@testing-library/user-event** | Simula interações reais do usuário (digitação, clique) |
| **@testing-library/jest-dom** | Matchers extras: `toBeInTheDocument`, `toHaveValue`, etc. |
| **jsdom** | Ambiente DOM simulado para rodar testes sem browser |

## Tipos de Teste

### Teste Unitário de Domínio/Serviço
- Testa lógica pura sem dependências externas
- Usa `jest.mock()` para isolar chamadas HTTP
- Localização: `src/domain/__tests__/`, `src/application/__tests__/`

### Teste de Componente
- Testa renderização e comportamento de componentes React
- Usa React Testing Library + userEvent
- Localização: `src/interfaces-graficas/**/__tests__/`

### Teste de Hook
- Testa custom hooks com `renderHook`
- Localização: junto ao hook ou em `__tests__/`

### Teste de Infraestrutura
- Testa repositórios e clientes HTTP com mocks
- Localização: `src/infrastructure/__tests__/`

## Estrutura de Diretórios

```
src/
├── __mocks__/
│   └── fileMock.js             ← Mock de arquivos estáticos (imagens, SVG)
├── setupTests.ts               ← Configuração global (jest-dom, supressão de warnings)
├── application/
│   ├── ClienteService.ts
│   └── __tests__/
│       └── ClienteService.test.ts
├── domain/
│   ├── Cliente.ts
│   └── __tests__/
│       └── Cliente.test.ts
├── infrastructure/
│   ├── ClienteRepository.ts
│   └── __tests__/
│       └── ClienteRepository.test.ts
└── interfaces-graficas/
    └── components/
        ├── ClienteForm.tsx
        └── __tests__/
            └── ClienteForm.test.tsx
```

## Convenções de Nomenclatura

### Arquivo de teste
`[NomeDoArquivo].test.ts(x)` — mesmo nome do arquivo testado, com `.test` antes da extensão.

### Describe
Nome da classe ou componente sendo testado:
```ts
describe('ClienteService', () => { ... })
describe('ClienteForm', () => { ... })
```

### Método (it/test)
Padrão obrigatório: `deve_[ação]_quando_[condição]`

```ts
it('deve_retornarCliente_quando_idValido', ...)
it('deve_exibirErro_quando_nomeVazio', ...)
it('deve_chamarOnSubmit_quando_formularioValido', ...)
```

## Configuração (jest.config.cjs)

O projeto já está configurado. Pontos importantes:

- `testEnvironment: 'jsdom'` — simula o DOM do browser
- `moduleNameMapper` — aliases `@/`, `@domain/`, `@application/`, etc.
- `setupFilesAfterEnv: ['./src/setupTests.ts']` — carrega jest-dom automaticamente
- `collectCoverageFrom` — coleta cobertura de `domain/`, `application/`, `infrastructure/` e utils

## Veja Também

- [COMO-CRIAR-TESTES.md](COMO-CRIAR-TESTES.md)
- [Testes de Componentes](02-Teste-Componente.md)
- [Melhores Práticas](05-Melhores-Praticas.md)
