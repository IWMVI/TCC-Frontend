# Como Criar Testes — Guia Prático (Frontend)

Guia passo a passo para criar testes no TCC-Frontend, com exemplos reais do projeto.

---

## Antes de começar

Execute os testes existentes para garantir que tudo está funcionando:

```bash
npm test
```

---

## Passo 1 — Escolha o tipo de teste

```
O que você quer testar?
│
├── Lógica de negócio (use case, serviço, domínio)?
│   └── → Teste Unitário puro (Jest)
│
├── Componente React (renderização, interação)?
│   └── → Teste de Componente (Jest + React Testing Library)
│
├── Custom Hook?
│   └── → Teste de Hook (renderHook do RTL)
│
└── Chamada HTTP à API?
    └── → Teste de Serviço com mock de axios (jest.mock)
```

---

## Passo 2 — Crie o arquivo no lugar certo

Crie uma pasta `__tests__` dentro do módulo que está testando:

```
src/
├── application/
│   ├── ClienteService.ts
│   └── __tests__/
│       └── ClienteService.test.ts      ← aqui
├── domain/
│   ├── Cliente.ts
│   └── __tests__/
│       └── Cliente.test.ts             ← aqui
└── interfaces-graficas/
    ├── components/
    │   ├── ClienteForm.tsx
    │   └── __tests__/
    │       └── ClienteForm.test.tsx    ← aqui
```

---

## Passo 3 — Nomeie corretamente

### Arquivo
`[NomeDoArquivoTestado].test.ts(x)`

### Describe e método
```ts
describe('ClienteService', () => {
  it('deve_retornarCliente_quando_idValido', () => { ... })
  it('deve_lancarErro_quando_clienteNaoEncontrado', () => { ... })
})
```

Padrão obrigatório para `it`: `deve_[ação]_quando_[condição]`

---

## Exemplos completos

### Teste de Serviço (com mock de axios)

```ts
// src/application/__tests__/ClienteService.test.ts
import axios from 'axios'
import { ClienteService } from '../ClienteService'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ClienteService', () => {
  describe('buscarPorId', () => {
    it('deve_retornarCliente_quando_idValido', async () => {
      // Arrange
      const clienteMock = { id: 1, nome: 'João Silva', email: 'joao@email.com' }
      mockedAxios.get.mockResolvedValueOnce({ data: clienteMock })

      // Act
      const resultado = await ClienteService.buscarPorId(1)

      // Assert
      expect(resultado.nome).toBe('João Silva')
      expect(mockedAxios.get).toHaveBeenCalledWith('/clientes/1')
    })

    it('deve_lancarErro_quando_apiFalhar', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'))

      // Act & Assert
      await expect(ClienteService.buscarPorId(999)).rejects.toThrow('Network Error')
    })
  })
})
```

### Teste de Componente React

```tsx
// src/interfaces-graficas/components/__tests__/ClienteForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClienteForm } from '../ClienteForm'

describe('ClienteForm', () => {
  it('deve_renderizarFormulario_quando_montado', () => {
    // Arrange & Act
    render(<ClienteForm onSubmit={jest.fn()} />)

    // Assert
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('deve_exibirErroDeValidacao_quando_nomeVazio', async () => {
    // Arrange
    render(<ClienteForm onSubmit={jest.fn()} />)

    // Act — clicar em salvar sem preencher
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    // Assert
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
  })

  it('deve_chamarOnSubmit_quando_formularioValido', async () => {
    // Arrange
    const onSubmit = jest.fn()
    render(<ClienteForm onSubmit={onSubmit} />)

    // Act
    await userEvent.type(screen.getByLabelText(/nome/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/cpf/i), '12345678900')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'João Silva' })
    )
  })
})
```

### Teste de Custom Hook

```ts
// src/application/__tests__/useCliente.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useCliente } from '../useCliente'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('useCliente', () => {
  it('deve_retornarDadosDoCliente_quando_idValido', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 1, nome: 'João Silva' }
    })

    // Act
    const { result } = renderHook(() => useCliente(1))

    // Assert
    await waitFor(() => {
      expect(result.current.cliente?.nome).toBe('João Silva')
      expect(result.current.loading).toBe(false)
    })
  })

  it('deve_definirErro_quando_apiFalhar', async () => {
    // Arrange
    mockedAxios.get.mockRejectedValueOnce(new Error('Erro de rede'))

    // Act
    const { result } = renderHook(() => useCliente(999))

    // Assert
    await waitFor(() => {
      expect(result.current.erro).toBeTruthy()
      expect(result.current.loading).toBe(false)
    })
  })
})
```

### Teste de Domínio (lógica pura)

```ts
// src/domain/__tests__/Cliente.test.ts
import { Cliente } from '../Cliente'

describe('Cliente', () => {
  describe('validarCpf', () => {
    it('deve_retornarTrue_quando_cpfValido', () => {
      const cliente = new Cliente({ cpfCnpj: '12345678900' })
      expect(cliente.cpfValido()).toBe(true)
    })

    it('deve_retornarFalse_quando_cpfInvalido', () => {
      const cliente = new Cliente({ cpfCnpj: '000' })
      expect(cliente.cpfValido()).toBe(false)
    })
  })
})
```

---

## Regras obrigatórias

| Regra | Correto | Errado |
|---|---|---|
| Nome do método | `deve_criar_quando_valido` | `testCriar`, `criarComSucesso` |
| Mock de módulos | `jest.mock('axios')` no topo do arquivo | Mock inline dentro do teste |
| Limpeza de mocks | `jest.clearAllMocks()` no `beforeEach` | Sem limpeza entre testes |
| Queries RTL | `getByRole`, `getByLabelText` | `getByTestId` (evitar) |
| Interações | `userEvent` (simula usuário real) | `fireEvent` (evitar quando possível) |
| Um teste, uma coisa | Cada `it` verifica um comportamento | Múltiplos `expect` em cenários diferentes |

---

## Executando os testes

```bash
# Todos os testes (execução única)
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com cobertura
npm run test:coverage
```

---

## Veja Também

- [Arquitetura de Testes](01-Arquitetura-Testes.md)
- [Testes de Componentes](02-Teste-Componente.md)
- [Testes de Serviços](04-Teste-Servico.md)
- [Melhores Práticas](05-Melhores-Praticas.md)
