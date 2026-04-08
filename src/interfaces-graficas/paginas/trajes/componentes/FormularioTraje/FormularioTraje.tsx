import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../../../../componentes/base/Botao';
import { TrajeRequest } from '../../../../../domain/entidades';
import styles from './FormularioTraje.module.css';

function gerarCodigo(nome: string) {
  const prefixo = nome
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X');
  const sufixo = Math.floor(100 + Math.random() * 900);
  return `TRJ-${prefixo}-${sufixo}`;
}

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
    codigo: trajeInicial.codigo || gerarCodigo(trajeInicial.nome || ''),
    nome: trajeInicial.nome || '',
    descricao: trajeInicial.descricao || '',
    tecido: trajeInicial.tecido || '',
    cor: trajeInicial.cor || '',
    estampa: trajeInicial.estampa || '',
    tipoTraje: trajeInicial.tipoTraje || '',
    preco: trajeInicial.preco || 0,
    tamanho: trajeInicial.tamanho || '',
    textura: trajeInicial.textura || '',
    status: trajeInicial.status || 'Disponível',
    sexo: trajeInicial.sexo || 'Unissex',
    condicao: trajeInicial.condicao || 'Novo',
    imagem: trajeInicial.imagem || '',
  });
  const [imagemPreview, setImagemPreview] = useState<string>(trajeInicial.imagem || '');

  const [errosValidacao, setErrosValidacao] = useState<Partial<Record<keyof TrajeRequest, string>>>({});

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    setFormData(prev => {
      const novoValor = name === 'preco' ? parseFloat(value) || 0 : value;
      const atualizaCodigo =
        name === 'nome' && !trajeInicial.codigo
          ? gerarCodigo(value)
          : prev.codigo;

      return {
        ...prev,
        [name]: novoValor,
        codigo: atualizaCodigo,
      } as TrajeRequest;
    });

    if (errosValidacao[name as keyof TrajeRequest]) {
      setErrosValidacao(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, imagem: base64 }));
      setImagemPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function validarFormulario(): boolean {
    const novosErros: Partial<Record<keyof TrajeRequest, string>> = {};

    if (!formData.codigo.trim()) {
      novosErros.codigo = 'Código é obrigatório';
    }

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!formData.tecido.trim()) {
      novosErros.tecido = 'Tecido é obrigatório';
    }

    if (!formData.tipoTraje.trim()) {
      novosErros.tipoTraje = 'Tipo do traje é obrigatório';
    }

    if (!formData.tamanho.trim()) {
      novosErros.tamanho = 'Tamanho é obrigatório';
    }

    if (!formData.cor.trim()) {
      novosErros.cor = 'Cor é obrigatória';
    }

    if (!formData.textura.trim()) {
      novosErros.textura = 'Textura é obrigatória';
    }

    if (!formData.status.trim()) {
      novosErros.status = 'Status é obrigatório';
    }

    if (!formData.sexo.trim()) {
      novosErros.sexo = 'Sexo é obrigatório';
    }

    if (!formData.condicao.trim()) {
      novosErros.condicao = 'Condição é obrigatória';
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
        <div className={styles.formularioTraje__conteudo}>
          <div className={styles.formularioTraje__principal}>
            <div className={styles.formularioTraje__linhaDois}>
              <div className={styles.formularioTraje__campo}>
                <label htmlFor="codigo" className={styles.formularioTraje__label}>
                  Código *
                </label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  readOnly
                  className={`${styles.formularioTraje__input} ${errosValidacao.codigo ? styles['formularioTraje__input--erro'] : ''}`}
                />
                {errosValidacao.codigo && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.codigo}</span>
                )}
              </div>

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
            </div>

            <div className={`${styles.formularioTraje__campo} ${styles['formularioTraje__campo--full']}`}>
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

            <div className={styles.formularioTraje__linhaDois}>
              <div className={styles.formularioTraje__campo}>
                <label htmlFor="tecido" className={styles.formularioTraje__label}>
                  Tecido *
                </label>
                <input
                  type="text"
                  id="tecido"
                  name="tecido"
                  value={formData.tecido}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__input} ${errosValidacao.tecido ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                />
                {errosValidacao.tecido && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.tecido}</span>
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
            </div>

            <div className={styles.formularioTraje__linhaDois}>
              <div className={styles.formularioTraje__campo}>
                <label htmlFor="estampa" className={styles.formularioTraje__label}>
                  Estampa
                </label>
                <input
                  type="text"
                  id="estampa"
                  name="estampa"
                  value={formData.estampa}
                  onChange={handleInputChange}
                  className={styles.formularioTraje__input}
                  disabled={estaEnviando}
                />
              </div>

              <div className={styles.formularioTraje__campo}>
                <label htmlFor="tipoTraje" className={styles.formularioTraje__label}>
                  Tipo do traje *
                </label>
                <select
                  id="tipoTraje"
                  name="tipoTraje"
                  value={formData.tipoTraje}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__select} ${errosValidacao.tipoTraje ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                >
                  <option value="">Selecione</option>
                  <option value="Sociedade">Sociedade</option>
                  <option value="Casamento">Casamento</option>
                  <option value="Festa">Festa</option>
                  <option value="Fantasias">Fantasias</option>
                  <option value="Casual">Casual</option>
                </select>
                {errosValidacao.tipoTraje && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.tipoTraje}</span>
                )}
              </div>
            </div>

            <div className={styles.formularioTraje__linhaTres}>
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
                <label htmlFor="textura" className={styles.formularioTraje__label}>
                  Textura *
                </label>
                <input
                  type="text"
                  id="textura"
                  name="textura"
                  value={formData.textura}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__input} ${errosValidacao.textura ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                />
                {errosValidacao.textura && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.textura}</span>
                )}
              </div>
            </div>

            <div className={styles.formularioTraje__linhaTres}>
              <div className={styles.formularioTraje__campo}>
                <label htmlFor="status" className={styles.formularioTraje__label}>
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__select} ${errosValidacao.status ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                >
                  <option value="">Selecione</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Indisponível">Indisponível</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Em manutenção">Em manutenção</option>
                </select>
                {errosValidacao.status && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.status}</span>
                )}
              </div>

              <div className={styles.formularioTraje__campo}>
                <label htmlFor="sexo" className={styles.formularioTraje__label}>
                  Sexo *
                </label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__select} ${errosValidacao.sexo ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Unissex">Unissex</option>
                </select>
                {errosValidacao.sexo && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.sexo}</span>
                )}
              </div>

              <div className={styles.formularioTraje__campo}>
                <label htmlFor="condicao" className={styles.formularioTraje__label}>
                  Condição *
                </label>
                <select
                  id="condicao"
                  name="condicao"
                  value={formData.condicao}
                  onChange={handleInputChange}
                  className={`${styles.formularioTraje__select} ${errosValidacao.condicao ? styles['formularioTraje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                >
                  <option value="">Selecione</option>
                  <option value="Novo">Novo</option>
                  <option value="Usado">Usado</option>
                  <option value="Reformado">Reformado</option>
                </select>
                {errosValidacao.condicao && (
                  <span className={styles.formularioTraje__erro}>{errosValidacao.condicao}</span>
                )}
              </div>
            </div>
          </div>

          <aside className={styles.formularioTraje__preview}>
            <div className={styles.formularioTraje__previewCard}>
              <span className={styles.formularioTraje__previewTitle}>Imagem do traje</span>
              <div className={styles.formularioTraje__previewWrapper}>
                {imagemPreview ? (
                  <img
                    src={imagemPreview}
                    alt="Pré-visualização do traje"
                    className={styles.formularioTraje__previewImage}
                  />
                ) : (
                  <div className={styles.formularioTraje__previewEmpty}>Nenhuma imagem selecionada</div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={estaEnviando}
              />
            </div>
          </aside>
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