import { createContext, useContext, useState, type ReactNode } from 'react';

interface ContextoMenuLateralType {
  expandido: boolean;
  alternarExpansao: () => void;
}

const ContextoMenuLateral = createContext<ContextoMenuLateralType | undefined>(undefined);

export function ProvedorMenuLateral({ children }: { children: ReactNode }) {
  const [expandido, setExpandido] = useState(true);

  function alternarExpansao() {
    setExpandido((atual) => !atual);
  }

  return (
    <ContextoMenuLateral.Provider value={{ expandido, alternarExpansao }}>
      {children}
    </ContextoMenuLateral.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook compartilhado com o provider
export function useMenuLateral() {
  const contexto = useContext(ContextoMenuLateral);
  if (!contexto) {
    throw new Error('useMenuLateral deve ser usado dentro de ProvedorMenuLateral');
  }
  return contexto;
}
