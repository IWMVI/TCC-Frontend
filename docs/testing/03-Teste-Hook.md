# Testes de Custom Hooks

## Visão Geral

Use `renderHook` do React Testing Library para testar hooks fora de componentes.

## Estrutura Básica

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { meuHook } from '../meuHook'

describe('meuHook', () => {
  it('deve_[ação]_quando_[condição]', async () => {
    // Arrange & Act
    const { result } = renderHook(() => meuHook())

    // Assert
    expect(result.current.valor).toBe('esperado')
  })
})
```

## Hook com Chamada Assíncrona

```ts
import { renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useCliente } from '../useCliente'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('useCliente', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve_retornarCliente_quando_idValido', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({
      data: { id: 1, nome: 'João Silva' }
    })

    // Act
    const { result } = renderHook(() => useCliente(1))

    // Assert — aguardar estado assíncrono
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cliente?.nome).toBe('João Silva')
    expect(result.current.erro).toBeNull()
  })

  it('deve_definirErro_quando_apiFalhar', async () => {
    // Arrange
    mockedAxios.get.mockRejectedValueOnce(new Error('Erro de rede'))

    // Act
    const { result } = renderHook(() => useCliente(999))

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.erro).toBeTruthy()
    expect(result.current.cliente).toBeNull()
  })

  it('deve_iniciarComLoadingTrue_quando_montado', () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} })

    const { result } = renderHook(() => useCliente(1))

    // Estado inicial — antes da promise resolver
    expect(result.current.loading).toBe(true)
  })
})
```

## Hook com Ação (act)

```ts
import { renderHook, act } from '@testing-library/react'
import { useContador } from '../useContador'

describe('useContador', () => {
  it('deve_incrementar_quando_chamarIncrementar', () => {
    const { result } = renderHook(() => useContador())

    act(() => {
      result.current.incrementar()
    })

    expect(result.current.valor).toBe(1)
  })
})
```

## Hook com Context

```tsx
import { renderHook } from '@testing-library/react'
import { AuthProvider } from '../AuthContext'
import { useAuth } from '../useAuth'

it('deve_retornarUsuario_quando_autenticado', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider usuarioMock={{ nome: 'Admin' }}>
      {children}
    </AuthProvider>
  )

  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.usuario?.nome).toBe('Admin')
})
```

## Veja Também

- [Arquitetura de Testes](01-Arquitetura-Testes.md)
- [Testes de Componentes](02-Teste-Componente.md)
- [Testes de Serviços](04-Teste-Servico.md)
