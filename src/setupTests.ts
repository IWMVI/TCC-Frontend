import '@testing-library/jest-dom';

// Suprimir React Router v7 deprecation warnings nos testes usando jest.spyOn
// Este approach garante que apenas avisos específicos sejam filtrados,
// mantendo outros avisos visíveis para debugging
const originalWarn = console.warn;

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const warningString = String(args[0] || '');
    
    // Filtrar apenas avisos específicos do React Router v7
    if (
      warningString.includes('React Router') &&
      (warningString.includes('Future Flag') ||
        warningString.includes('v7_startTransition') ||
        warningString.includes('v7_relativeSplatPath'))
    ) {
      return; // Suprimir apenas este aviso
    }
    
    // Permitir todos os outros avisos
    originalWarn(...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});