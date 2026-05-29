import { useEffect, useRef, useState } from 'react';

export function useLarguraElemento<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) {
      return;
    }

    function atualizar() {
      if (!elemento) {
        return;
      }
      setLargura(elemento.getBoundingClientRect().width);
    }

    atualizar();

    const observador = new ResizeObserver(() => {
      atualizar();
    });

    observador.observe(elemento);

    return () => {
      observador.disconnect();
    };
  }, []);

  return { ref, largura };
}
