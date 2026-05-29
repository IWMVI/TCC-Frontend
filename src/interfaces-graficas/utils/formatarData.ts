import { normalizarDataIso } from '@domain/utils/dataIso';

const FORMATO_DATA_NUMERICA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const FORMATO_DATA_EXTENSA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const PADRAO_ISO = /^(\d{4})-(\d{2})-(\d{2})/;
const PADRAO_BR = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function parseParaDateLocal(valor: string): Date | null {
  const texto = valor.trim();
  if (!texto) {
    return null;
  }

  const base = texto.split('T')[0];

  const iso = PADRAO_ISO.exec(base);
  if (iso) {
    const ano = Number(iso[1]);
    const mes = Number(iso[2]);
    const dia = Number(iso[3]);
    const data = new Date(ano, mes - 1, dia);
    if (
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia
    ) {
      return data;
    }
    return null;
  }

  const br = PADRAO_BR.exec(base);
  if (br) {
    const dia = Number(br[1]);
    const mes = Number(br[2]);
    const ano = Number(br[3]);
    const data = new Date(ano, mes - 1, dia);
    if (
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia
    ) {
      return data;
    }
    return null;
  }

  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarDataBr(valor?: string | null | unknown): string {
  if (valor == null) {
    return '';
  }

  if (Array.isArray(valor)) {
    return formatarDataBr(normalizarDataIso(valor));
  }

  const texto = String(valor).trim();
  if (!texto) {
    return '';
  }

  const data = parseParaDateLocal(texto);
  if (!data) {
    return texto;
  }

  return FORMATO_DATA_NUMERICA.format(data);
}

export function formatarDataExtensoBr(valor?: string | Date | null): string {
  if (valor == null) {
    return '';
  }

  if (valor instanceof Date) {
    return FORMATO_DATA_EXTENSA.format(valor);
  }

  const texto = String(valor).trim();
  if (!texto) {
    return '';
  }

  const data = parseParaDateLocal(texto);
  if (!data) {
    return texto;
  }

  return FORMATO_DATA_EXTENSA.format(data);
}

export function formatarDataHojeExtensoBr(): string {
  return FORMATO_DATA_EXTENSA.format(new Date());
}
