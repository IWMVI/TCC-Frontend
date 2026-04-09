import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../../../../componentes/base/Botao';
import { TrajeRequest } from '../../../../../domain/entidades';
import { enumApiRepository, EnumValues } from '../../../../../infrastructure/api';
import styles from './FormularioTraje.module.css';

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
}: Readonly<FormularioTrajeProps>) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TrajeRequest>({
    nome: '',
    descricao: '',
    tecido: '',
    cor: '',
    estampa: '',
    tipoTraje: '',
    preco: 0,
    tamanho: '',
    textura: '',
    status: '',
    sexo: '',
    condicao: '',
    imagem: '',
  });

  useEffect(() => {
    if (trajeInicial) {
      setFormData((prev) => ({
        ...prev,
        nome: trajeInicial.nome || '',
        descricao: trajeInicial.descricao || '',
        tecido: trajeInicial.tecido || '',
        cor: trajeInicial.cor || '',
        estampa: trajeInicial.estampa || '',
        tipoTraje: trajeInicial.tipoTraje || '',
        preco: trajeInicial.preco || 0,
        tamanho: trajeInicial.tamanho || '',
        textura: trajeInicial.textura || '',
        status: trajeInicial.status || '',
        sexo: trajeInicial.sexo || '',
        condicao: trajeInicial.condicao || '',
        imagem: trajeInicial.imagem || '',
      }));
    }
  }, [trajeInicial]);
  const [imagemPreview, setImagemPreview] = useState<string>(trajeInicial.imagem || '');
  const [opcoesEnum, setOpcoesEnum] = useState<EnumValues | null>(null);

  useEffect(() => {
    enumApiRepository.buscarValoresEnum().then(setOpcoesEnum).catch(console.error);
  }, []);

  const [errosValidacao, setErrosValidacao] = useState<Partial<Record<keyof TrajeRequest, string>>>(
    {}
  );

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => {
      const novoValor = name === 'preco' ? Number.parseFloat(value) || 0 : value;

      return {
        ...prev,
        [name]: novoValor,
      } as TrajeRequest;
    });

    if (errosValidacao[name as keyof TrajeRequest]) {
      setErrosValidacao((prev) => ({
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
      setFormData((prev) => ({ ...prev, imagem: base64 }));
      setImagemPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function validarFormulario(): boolean {
    const novosErros: Partial<Record<keyof TrajeRequest, string>> = {};

    if (!formData.nome?.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao?.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!formData.tecido) {
      novosErros.tecido = 'Tecido é obrigatório';
    }

    if (!formData.tipoTraje) {
      novosErros.tipoTraje = 'Tipo do traje é obrigatório';
    }

    if (!formData.tamanho) {
      novosErros.tamanho = 'Tamanho é obrigatório';
    }

    if (!formData.cor) {
      novosErros.cor = 'Cor é obrigatória';
    }

    if (!formData.textura) {
      novosErros.textura = 'Textura é obrigatória';
    }

    if (!formData.status) {
      novosErros.status = 'Status é obrigatório';
    }

    if (!formData.sexo) {
      novosErros.sexo = 'Sexo é obrigatório';
    }

    if (!formData.condicao) {
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

  function renderSelect(
    name: keyof TrajeRequest,
    label: string,
    options: string[],
    obrigatorio = false
  ) {
    const erro = errosValidacao[name];
    const currentValue = formData[name] as string;
    const hasSelected = currentValue !== '';

    return (
      <div className={styles.formularioTraje__campo}>
        <label htmlFor={name} className={styles.formularioTraje__label}>
          {label} {obrigatorio && '*'}
        </label>
        <select
          id={name}
          name={name}
          value={currentValue}
          onChange={handleInputChange}
          className={`${styles.formularioTraje__select} ${erro ? styles['formularioTraje__input--erro'] : ''}`}
          disabled={estaEnviando}
        >
          <option value="" disabled={hasSelected}>
            Selecione
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {erro && <span className={styles.formularioTraje__erro}>{erro}</span>}
      </div>
    );
  }

  if (!opcoesEnum) {
    return <div>Carregando...</div>;
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

            <div
              className={`${styles.formularioTraje__campo} ${styles['formularioTraje__campo--full']}`}
            >
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
              {renderSelect('tecido', 'Tecido', opcoesEnum.tecido, true)}
              {renderSelect('cor', 'Cor', opcoesEnum.cor, true)}
            </div>

            <div className={styles.formularioTraje__linhaDois}>
              {renderSelect('estampa', 'Estampa', opcoesEnum.estampa)}
              {renderSelect('tipoTraje', 'Tipo do traje', opcoesEnum.tipoTraje, true)}
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

              {renderSelect('tamanho', 'Tamanho', opcoesEnum.tamanho, true)}
              {renderSelect('textura', 'Textura', opcoesEnum.textura, true)}
            </div>

            <div className={styles.formularioTraje__linhaTres}>
              {renderSelect('status', 'Status', opcoesEnum.status, true)}
              {renderSelect('sexo', 'Sexo', opcoesEnum.sexo, true)}
              {renderSelect('condicao', 'Condição', opcoesEnum.condicao, true)}
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
                  <div className={styles.formularioTraje__previewEmpty}>
                    Nenhuma imagem selecionada
                  </div>
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

        {erro && <div className={styles.formularioTraje__erroGeral}>{erro}</div>}

        <div className={styles.formularioTraje__botoes}>
          <Botao tipo="secundario" onClick={() => navigate('/trajes')} disabled={estaEnviando}>
            Cancelar
          </Botao>
          <Botao tipo="primario" tipoHtml="submit" disabled={estaEnviando}>
            {estaEnviando ? 'Salvando...' : 'Salvar'}
          </Botao>
        </div>
      </form>
    </div>
  );
}
