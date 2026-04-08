# Melhores Práticas de Teste — Frontend

## Convenções de Nomenclatura

```ts
// Correto
it('deve_exibirErro_quando_nomeVazio', ...)
it('deve_chamarOnSubmit_quando_formularioValido', ...)
it('deve_retornarCliente_quando_idValido', ...)

// Errado
it('testaCriarCliente', ...)
it('verifica se exibe erro', ...)
it('test1', ...)
```

## Queries RTL — Use na Ordem Certa

```ts
// Preferir (acessível, reflete o que o usuário vê)
screen.getByRole('button', { name: /salvar/i })
screen.getByLabelText(/nome/i)
screen.getByText(/cliente cadastrado/i)

// Evitar (frágil, acoplado à implementação)
screen.getByTestId('btn-salvar')
container.querySelector('.btn-primary')
```

## Interações — Use userEvent

```ts
// Correto — simula comportamento real do usuário
await userEvent.type(input, 'João Silva')
await userEvent.click(button)
await userEvent.selectOptions(select, 'MASCULINO')

// Evitar — não simula eventos reais
fireEvent.change(input, { target: { value: 'João Silva' } })
```

## Mocks — Boas Práticas

```ts
// Limpar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks()
})

// Mockar apenas o necessário
jest.mock('axios') // Sim
jest.mock('../ClienteService') // Apenas se necessário

// Usar mockResolvedValueOnce (não mockResolvedValue)
// para evitar que um mock vaze para o próximo teste
mockedAxios.get.mockResolvedValueOnce({ data: clienteMock })
```

## Anti-Padrões a Evitar

### 1. Testar detalhes de implementação

```tsx
// Ruim — testa estado interno
expect(component.state.nome).toBe('João')

// Bom — testa o que o usuário vê
expect(screen.getByDisplayValue('João')).toBeInTheDocument()
```

### 2. Usar getByTestId desnecessariamente

```tsx
// Ruim
<button data-testid="btn-salvar">Salvar</button>
screen.getByTestId('btn-salvar')

// Bom
<button type="submit">Salvar</button>
screen.getByRole('button', { name: /salvar/i })
```

### 3. Não aguardar operações assíncronas

```tsx
// Ruim — pode falhar por race condition
expect(screen.getByText('João Silva')).toBeInTheDocument()

// Bom — aguarda o elemento aparecer
expect(await screen.findByText('João Silva')).toBeInTheDocument()
// ou
await waitFor(() => {
  expect(screen.getByText('João Silva')).toBeInTheDocument()
})
```

### 4. Testes dependentes entre si

```ts
// Ruim — segundo teste depende do primeiro
let clienteId: number

it('deve_criar', async () => {
  clienteId = await service.criar(dados)
})

it('deve_buscar', async () => {
  await service.buscarPorId(clienteId) // depende do teste anterior
})

// Bom — cada teste é independente
it('deve_buscar_quando_idValido', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { id: 1 } })
  await service.buscarPorId(1)
})
```

## Checklist para Novos Testes

- [ ] Nome do `it` segue `deve_[ação]_quando_[condição]`
- [ ] Estrutura AAA com comentários `// Arrange`, `// Act`, `// Assert`
- [ ] Queries RTL usam `getByRole` ou `getByLabelText` (não `getByTestId`)
- [ ] Interações usam `userEvent` (não `fireEvent`)
- [ ] Mocks limpos no `beforeEach` com `jest.clearAllMocks()`
- [ ] Operações assíncronas aguardadas com `findBy*` ou `waitFor`
- [ ] Cada `it` testa apenas uma coisa

## Executando os Testes

```bash
# Execução única
npm test

# Modo watch
npm run test:watch

# Com cobertura (mínimo 50% configurado)
npm run test:coverage
```

## Veja Também

- [Arquitetura de Testes](01-Arquitetura-Testes.md)
- [Testes de Componentes](02-Teste-Componente.md)
- [COMO-CRIAR-TESTES.md](COMO-CRIAR-TESTES.md)
