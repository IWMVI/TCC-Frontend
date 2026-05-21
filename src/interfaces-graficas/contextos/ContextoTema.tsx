import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Tema = 'light' | 'dark';

interface ContextoTemaType {
  tema: Tema;
  alternarTema: () => void;
}

const ContextoTema = createContext<ContextoTemaType | undefined>(undefined);

export function ProvedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    const temaSalvo = localStorage.getItem('tema');
    return (temaSalvo as Tema) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tema', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((temaAtual) => (temaAtual === 'light' ? 'dark' : 'light'));
  };

  return (
    <ContextoTema.Provider value={{ tema, alternarTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook compartilhado com o provider
export function useTema() {
  const contexto = useContext(ContextoTema);
  if (contexto === undefined) {
    throw new Error('useTema deve ser usado dentro de um ProvedorTema');
  }
  return contexto;
}
