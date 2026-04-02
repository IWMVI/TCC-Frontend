import '@testing-library/jest-dom';

// Manter referência ao console.warn original para avisos não filtrados
const originalWarn = console.warn;

// Suprimir React Router v7 deprecation warnings apenas para testes de componentes
// que usam BrowserRouter/MemoryRouter
let warnSpy: jest.SpyInstance;

beforeAll(() => {
  warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const warningString = String(args[0] || '');
    // Filtrar apenas avisos específicos de deprecação do React Router v7
    if (
      warningString.includes('React Router') &&
      (warningString.includes('Future Flag') ||
        warningString.includes('v7_startTransition') ||
        warningString.includes('v7_relativeSplatPath'))
    ) {
      return;
    }
    // Permitir que outros avisos passem normalmente (não suprimidos)
    originalWarn(...args);
  });
});

afterAll(() => {
  warnSpy.mockRestore();
});