const DIVISOES_PADRAO = 4;

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function calcularPassoBonito(maximo: number, divisoes: number): number {
  const passoBruto = maximo / divisoes;
  const potencia = 10 ** Math.floor(Math.log10(passoBruto));
  const normalizado = passoBruto / potencia;

  let multiplicador = 10;
  if (normalizado <= 1) {
    multiplicador = 1;
  } else if (normalizado <= 2) {
    multiplicador = 2;
  } else if (normalizado <= 5) {
    multiplicador = 5;
  }

  return multiplicador * potencia;
}

export interface EscalaGrafico {
  maximo: number;
  marcas: number[];
}

export function calcularEscalaGraficoInteira(
  valorMaximoDados: number,
  divisoes = DIVISOES_PADRAO,
): EscalaGrafico {
  if (valorMaximoDados <= 0) {
    return { maximo: 0, marcas: [0] };
  }

  const maximo = Math.max(Math.ceil(valorMaximoDados), 1);
  const passo = Math.max(1, Math.ceil(maximo / divisoes));
  const marcas: number[] = [];

  for (let valor = maximo; valor >= 0; valor -= passo) {
    marcas.push(valor);
  }

  if (marcas[marcas.length - 1] !== 0) {
    marcas.push(0);
  }

  return { maximo, marcas };
}

export function calcularEscalaGraficoMonetario(
  valorMaximoDados: number,
  divisoes = DIVISOES_PADRAO,
): EscalaGrafico {
  if (valorMaximoDados <= 0) {
    return { maximo: 0, marcas: [0] };
  }

  if (valorMaximoDados < 10) {
    return calcularEscalaGraficoInteira(valorMaximoDados, divisoes);
  }

  return calcularEscalaGrafico(valorMaximoDados, divisoes);
}

export function calcularEscalaGrafico(
  valorMaximoDados: number,
  divisoes = DIVISOES_PADRAO,
): EscalaGrafico {
  if (valorMaximoDados <= 0) {
    return { maximo: 0, marcas: [0] };
  }

  const passo = calcularPassoBonito(valorMaximoDados, divisoes);
  const maximo = arredondar(Math.ceil(valorMaximoDados / passo) * passo);
  const marcas: number[] = [];

  for (let valor = maximo; valor >= 0; valor -= passo) {
    marcas.push(arredondar(valor));
  }

  return { maximo, marcas };
}
