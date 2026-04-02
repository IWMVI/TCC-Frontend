import '@testing-library/jest-dom';

// Suprimir React Router v7 deprecation warnings nos testes
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const warningString = String(args[0] || '');
  if (
    warningString.includes('React Router') &&
    (warningString.includes('Future Flag') ||
      warningString.includes('v7_startTransition') ||
      warningString.includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  originalWarn(...args);
};