import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../../../../componentes/base/Botao';
import { TrajeRequest } from '../../../../../domain/entidades';
import styles from './FormularioTraje.module.css';

// TODO: mudar as propriedades do traje depois para o que foi definido no prototipo HI-FI, e o formulário irá ser atualizado para refletir essas mudanças.

interface FormularioTrajeProps {
  titulo: string;
  trajeInicial?: Partial<TrajeRequest>;
  estaEnviando: boolean;
  erro: string | null;
  onSubmit: (dados: TrajeRequest) => Promise<unknown>;
}

export function FormularioTraje({
  titulo,
  trajeInicial = {},
  estaEnviando,
  erro,
  onSubmit,
}: FormularioTrajeProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TrajeRequest>({
    nome: trajeInicial.nome || '',
    descricao: trajeInicial.descricao || '',
    tamanho: trajeInicial.tamanho || '',
    cor: trajeInicial.cor || '',
    preco: trajeInicial.preco || 0,
  });

  const [errosValidacao, setErrosValidacao] = useState<Partial<Record<keyof TrajeRequest, string>>>({});

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'preco' ? parseFloat(value) || 0 : value,
    }));
    // Limpar erro do campo
    if (errosValidacao[name as keyof TrajeRequest]) {
      setErrosValidacao(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }

  function validarFormulario(): boolean {
    const novosErros: Partial<Record<keyof TrajeRequest, string>> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!formData.tamanho.trim()) {
      novosErros.tamanho = 'Tamanho é obrigatório';
    }

    if (!formData.cor.trim()) {
      novosErros.cor = 'Cor é obrigatória';
    }

    if (formData.preco <= 0) {
      novosErros.preco = 'Preço deve ser maior que zero';
    }

    setErrosValidacao(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Erro já tratado no componente pai
    }
  }

  return (
    <div className={styles.formularioTraje}>
      <button
        className={styles.formularioTraje__voltar}
        onClick={() => navigate('/trajes')}
        type="button"
      >
        ← Voltar
      </button>

      <section className={styles.formularioTraje__cabecalho}>
        <h1 className={styles.formularioTraje__titulo}>{titulo}</h1>
      </section>

      <form className={styles.formularioTraje__form} onSubmit={handleSubmit}>
        <div className={styles.formularioTraje__campo}>
          <label htmlFor="nome" className={styles.formularioTraje__label}>
            Nome *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className={`${styles.formularioTraje__input} ${errosValidacao.nome ? styles['formularioTraje__input--erro'] : ''}`}
            disabled={estaEnviando}
          />
          {errosValidacao.nome && (
            <span className={styles.formularioTraje__erro}>{errosValidacao.nome}</span>
          )}
        </div>

        <div className={styles.formularioTraje__campo}>
          <label htmlFor="descricao" className={styles.formularioTraje__label}>
            Descrição *
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            className={`${styles.formularioTraje__textarea} ${errosValidacao.descricao ? styles['formularioTraje__textarea--erro'] : ''}`}
            disabled={estaEnviando}
            rows={4}
          />
          {errosValidacao.descricao && (
            <span className={styles.formularioTraje__erro}>{errosValidacao.descricao}</span>
          )}
        </div>

        <div className={styles.formularioTraje__campo}>
          <label htmlFor="tamanho" className={styles.formularioTraje__label}>
            Tamanho *
          </label>
          <input
            type="text"
            id="tamanho"
            name="tamanho"
            value={formData.tamanho}
            onChange={handleInputChange}
            className={`${styles.formularioTraje__input} ${errosValidacao.tamanho ? styles['formularioTraje__input--erro'] : ''}`}
            disabled={estaEnviando}
          />
          {errosValidacao.tamanho && (
            <span className={styles.formularioTraje__erro}>{errosValidacao.tamanho}</span>
          )}
        </div>

        <div className={styles.formularioTraje__campo}>
          <label htmlFor="cor" className={styles.formularioTraje__label}>
            Cor *
          </label>
          <input
            type="text"
            id="cor"
            name="cor"
            value={formData.cor}
            onChange={handleInputChange}
            className={`${styles.formularioTraje__input} ${errosValidacao.cor ? styles['formularioTraje__input--erro'] : ''}`}
            disabled={estaEnviando}
          />
          {errosValidacao.cor && (
            <span className={styles.formularioTraje__erro}>{errosValidacao.cor}</span>
          )}
        </div>

        <div className={styles.formularioTraje__campo}>
          <label htmlFor="preco" className={styles.formularioTraje__label}>
            Preço (R$) *
          </label>
          <input
            type="number"
            id="preco"
            name="preco"
            value={formData.preco}
            onChange={handleInputChange}
            className={`${styles.formularioTraje__input} ${errosValidacao.preco ? styles['formularioTraje__input--erro'] : ''}`}
            disabled={estaEnviando}
            step="0.01"
            min="0"
          />
          {errosValidacao.preco && (
            <span className={styles.formularioTraje__erro}>{errosValidacao.preco}</span>
          )}
        </div>

        {erro && (
          <div className={styles.formularioTraje__erroGeral}>
            {erro}
          </div>
        )}

        <div className={styles.formularioTraje__botoes}>
          <Botao
            tipo="secundario"
            onClick={() => navigate('/trajes')}
            disabled={estaEnviando}
          >
            Cancelar
          </Botao>
          <Botao
            tipo="primario"
            tipoHtml="submit"
            disabled={estaEnviando}
          >
            {estaEnviando ? 'Salvando...' : 'Salvar'}
          </Botao>
        </div>
      </form>
    </div>
  );
}