# Testes de Serviços e Infraestrutura

## Visão Geral

Serviços e repositórios fazem chamadas HTTP via `axios`. Use `jest.mock('axios')` para isolar os testes da rede real.

## Padrão de Mock do Axios

```ts
import axios from 'axios'
import { ClienteService } from '../ClienteService'

// Mock do módulo inteiro
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ClienteService', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Limpar mocks entre testes
  })

  // ... testes
})
```

## Exemplos por Operação

### GET — buscar por ID

```ts
it('deve_retornarCliente_quando_idValido', async () => {
  // Arrange
  const clienteMock = { id: 1, nome: 'João Silva', email: 'joao@email.com' }
  mockedAxios.get.mockResolvedValueOnce({ data: clienteMock })

  // Act
  const resultado = await ClienteService.buscarPorId(1)

  // Assert
  expect(resultado).toEqual(clienteMock)
  expect(mockedAxios.get).toHaveBeenCalledWith('/clientes/1')
})
```

### GET — listar com filtro

```ts
it('deve_retornarLista_quando_filtroAplicado', async () => {
  // Arrange
  const listaMock = [{ id: 1, nome: 'João' }, { id: 2, nome: 'Maria' }]
  mockedAxios.get.mockResolvedValueOnce({ data: listaMock })

  // Act
  const resultado = await ClienteService.listar({ busca: 'João' })

  // Assert
  expect(resultado).toHaveLength(2)
  expect(mockedAxios.get).toHaveBeenCalledWith('/clientes', {
    params: { busca: 'João' }
  })
})
```

### POST — criar

```ts
it('deve_criarCliente_quando_dadosValidos', async () => {
  // Arrange
  const novoCliente = { nome: 'João Silva', cpfCnpj: '12345678900' }
  const respostaMock = { id: 1, ...novoCliente }
  mockedAxios.post.mockResolvedValueOnce({ data: respostaMock })

  // Act
  const resultado = await ClienteService.criar(novoCliente)

  // Assert
  expect(resultado.id).toBe(1)
  expect(mockedAxios.post).toHaveBeenCalledWith('/clientes', novoCliente)
})
```

### PUT — atualizar

```ts
it('deve_atualizarCliente_quando_dadosValidos', async () => {
  // Arrange
  const dadosAtualizados = { nome: 'João Atualizado' }
  mockedAxios.put.mockResolvedValueOnce({ data: { id: 1, ...dadosAtualizados } })

  // Act
  const resultado = await ClienteService.atualizar(1, dadosAtualizados)

  // Assert
  expect(resultado.nome).toBe('João Atualizado')
  expect(mockedAxios.put).toHaveBeenCalledWith('/clientes/1', dadosAtualizados)
})
```

### DELETE

```ts
it('deve_deletarCliente_quando_idValido', async () => {
  // Arrange
  mockedAxios.delete.mockResolvedValueOnce({ data: null })

  // Act
  await ClienteService.deletar(1)

  // Assert
  expect(mockedAxios.delete).toHaveBeenCalledWith('/clientes/1')
})
```

### Erro HTTP

```ts
it('deve_lancarErro_quando_apiFalhar', async () => {
  // Arrange
  mockedAxios.get.mockRejectedValueOnce({
    response: { status: 404, data: { message: 'Cliente não encontrado' } }
  })

  // Act & Assert
  await expect(ClienteService.buscarPorId(999)).rejects.toMatchObject({
    response: { status: 404 }
  })
})
```

## Testando Tratamento de Erros

```ts
it('deve_retornarMensagemAmigavel_quando_erro404', async () => {
  // Arrange
  mockedAxios.get.mockRejectedValueOnce({
    response: { status: 404, data: { message: 'Cliente não encontrado' } }
  })

  // Act
  const resultado = await ClienteService.buscarPorIdComTratamento(999)

  // Assert
  expect(resultado.erro).toBe('Cliente não encontrado')
  expect(resultado.dados).toBeNull()
})
```

## Veja Também

- [Arquitetura de Testes](01-Arquitetura-Testes.md)
- [Testes de Hooks](03-Teste-Hook.md)
- [Melhores Práticas](05-Melhores-Praticas.md)
