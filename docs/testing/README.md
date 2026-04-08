# Padrões de Testes — TCC-Frontend

Guia de referência para criação e organização de testes no projeto TCC-Frontend (React + TypeScript + Electron).

## Stack de Testes

| Ferramenta | Versão | Propósito |
|---|---|---|
| **Jest** | 30.x | Framework de teste |
| **ts-jest** | 29.x | Suporte a TypeScript no Jest |
| **React Testing Library** | 16.x | Teste de componentes React |
| **@testing-library/user-event** | 14.x | Simulação de interações do usuário |
| **@testing-library/jest-dom** | 6.x | Matchers customizados para DOM |
| **jsdom** | (via jest-environment-jsdom) | Ambiente DOM simulado |

## Início Rápido

```bash
# Executar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

## Índice

| Documento | Descrição |
|---|---|
| [COMO-CRIAR-TESTES.md](COMO-CRIAR-TESTES.md) | Guia passo a passo para criar testes |
| [01-Arquitetura-Testes.md](01-Arquitetura-Testes.md) | Estrutura de pastas, convenções e tipos de teste |
| [02-Teste-Componente.md](02-Teste-Componente.md) | Testes de componentes React com RTL |
| [03-Teste-Hook.md](03-Teste-Hook.md) | Testes de custom hooks |
| [04-Teste-Servico.md](04-Teste-Servico.md) | Testes de serviços e chamadas de API |
| [05-Melhores-Praticas.md](05-Melhores-Praticas.md) | Convenções, anti-padrões e checklist |

## Estrutura de Diretórios de Testes

```
src/
├── __mocks__/              ← Mocks globais (arquivos, módulos)
├── application/
│   └── __tests__/          ← Testes de use cases / serviços
├── domain/
│   └── __tests__/          ← Testes de entidades e regras de domínio
├── infrastructure/
│   └── __tests__/          ← Testes de repositórios e APIs
└── interfaces-graficas/
    └── __tests__/          ← Testes de componentes React
```

## Convenção de Nomenclatura

| Tipo | Padrão | Exemplo |
|---|---|---|
| Arquivo de teste | `[Arquivo].test.ts(x)` | `ClienteService.test.ts` |
| Describe | Nome da classe/componente | `describe('ClienteService', ...)` |
| Método de teste | `deve_[ação]_quando_[condição]` | `deve_retornarCliente_quando_idValido` |

## Veja Também

- [COMO-CRIAR-TESTES.md](COMO-CRIAR-TESTES.md)
- [Melhores Práticas](05-Melhores-Praticas.md)
