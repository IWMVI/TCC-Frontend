# Testes de Componentes React

## Princípio

Teste o que o usuário vê e faz, não os detalhes de implementação. Use queries que refletem como o usuário interage com a interface.

## Queries — Ordem de Preferência

| Prioridade | Query | Quando usar |
|---|---|---|
| 1 (melhor) | `getByRole` | Botões, inputs, links, headings |
| 2 | `getByLabelText` | Campos de formulário com label |
| 3 | `getByPlaceholderText` | Inputs com placeholder |
| 4 | `getByText` | Textos visíveis na tela |
| 5 | `getByDisplayValue` | Valor atual de input/select |
| 6 (evitar) | `getByTestId` | Último recurso |

## Estrutura Básica

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeuComponente } from '../MeuComponente'

describe('MeuComponente', () => {
  it('deve_[ação]_quando_[condição]', async () => {
    // Arrange
    render(<MeuComponente prop="valor" />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /texto/i }))

    // Assert
    expect(screen.getByText(/resultado esperado/i)).toBeInTheDocument()
  })
})
```

## Exemplos por Cenário

### Renderização inicial

```tsx
it('deve_exibirCamposDoFormulario_quando_montado', () => {
  render(<ClienteForm onSubmit={jest.fn()} />)

  expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
})
```

### Interação do usuário

```tsx
it('deve_preencherCampo_quando_usuarioDigita', async () => {
  render(<ClienteForm onSubmit={jest.fn()} />)

  await userEvent.type(screen.getByLabelText(/nome/i), 'João Silva')

  expect(screen.getByLabelText(/nome/i)).toHaveValue('João Silva')
})
```

### Validação de formulário

```tsx
it('deve_exibirErro_quando_campoObrigatorioVazio', async () => {
  render(<ClienteForm onSubmit={jest.fn()} />)

  await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
})
```

### Componente com estado assíncrono

```tsx
it('deve_exibirDados_quando_carregamentoCompleto', async () => {
  render(<ListaClientes />)

  // Enquanto carrega
  expect(screen.getByText(/carregando/i)).toBeInTheDocument()

  // Após carregar
  expect(await screen.findByText('João Silva')).toBeInTheDocument()
})
```

### Componente com React Router

```tsx
import { MemoryRouter } from 'react-router-dom'

it('deve_renderizarLink_quando_montado', () => {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  )

  expect(screen.getByRole('link', { name: /clientes/i })).toBeInTheDocument()
})
```

## Matchers Úteis do jest-dom

```ts
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveValue('texto')
expect(element).toHaveTextContent('texto')
expect(element).toHaveClass('minha-classe')
expect(element).toHaveFocus()
```

## Limpeza entre Testes

O RTL limpa o DOM automaticamente após cada teste. Para mocks, adicione no `beforeEach`:

```ts
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Veja Também

- [Arquitetura de Testes](01-Arquitetura-Testes.md)
- [Testes de Hooks](03-Teste-Hook.md)
- [Melhores Práticas](05-Melhores-Praticas.md)
