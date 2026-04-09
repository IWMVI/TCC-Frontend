import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { Botao } from '@interfaces-graficas/componentes/base/Botao';
import { ModalVisualizacaoImagem } from '@interfaces-graficas/componentes/feedback/ModalVisualizacaoImagem';
import { LoadingState } from '@interfaces-graficas/componentes/feedback/LoadingState';
import { TrajeRequest } from '@domain/entidades';
import { enumApiRepository, EnumValues } from '@infrastructure/api';
import { TRAJE_CONSTANTS } from '@application/trajes/TrajeDependencies';
import { useFormTraje, formatarValorDigitado, useImageHandler } from '@application/trajes/hooks';
import styles from './FormularioTraje.module.css';

interface FormularioTrajeProps {
  titulo: string;
  trajeInicial?: Partial<TrajeRequest>;
  estaEnviando: boolean;
  erro: string | null;
  onSubmit: (dados: TrajeRequest) => Promise<unknown>;
}

const MENSAGENS_VALIDACAO = {
  nomeObrigatorio: 'Nome é obrigatório',
  descricaoObrigatoria: 'Descrição é obrigatória',
  tecidoObrigatorio: 'Tecido é obrigatório',
  tipoObrigatorio: 'Tipo do traje é obrigatório',
  tamanhoObrigatorio: 'Tamanho é obrigatório',
  corObrigatoria: 'Cor é obrigatória',
  texturaObrigatoria: 'Textura é obrigatória',
  statusObrigatorio: 'Status é obrigatório',
  sexoObrigatorio: 'Sexo é obrigatório',
  condicaoObrigatoria: 'Condição é obrigatória',
  precoInvalido: 'Preço deve ser maior que zero',
} as const;

export function FormularioTraje({
  titulo,
  trajeInicial = {},
  estaEnviando,
  erro,
  onSubmit,
}: Readonly<FormularioTrajeProps>) {
  const navigate = useNavigate();
  const [opcoesEnum, setOpcoesEnum] = useState<EnumValues | null>(null);
  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [valorItemDisplay, setValorItemDisplay] = useState('');

  const { formData, errosValidacao, setField, setErro, imagemPreview, setImagemPreview } = useFormTraje({
    trajeInicial,
  });

  const { handleFileChange, handleRemover } = useImageHandler();

  useEffect(() => {
    enumApiRepository.buscarValoresEnum().then(setOpcoesEnum).catch(console.error);
  }, []);

  useEffect(() => {
    if (trajeInicial.valorItem) {
      setValorItemDisplay(
        trajeInicial.valorItem.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }, [trajeInicial.valorItem]);

  const validar = useCallback((dados: TrajeRequest): boolean => {
    const erros: Partial<Record<keyof TrajeRequest, string>> = {};

    if (!dados.nome?.trim()) erros.nome = MENSAGENS_VALIDACAO.nomeObrigatorio;
    if (!dados.descricao?.trim()) erros.descricao = MENSAGENS_VALIDACAO.descricaoObrigatoria;
    if (!dados.tecido) erros.tecido = MENSAGENS_VALIDACAO.tecidoObrigatorio;
    if (!dados.tipo) erros.tipo = MENSAGENS_VALIDACAO.tipoObrigatorio;
    if (!dados.tamanho) erros.tamanho = MENSAGENS_VALIDACAO.tamanhoObrigatorio;
    if (!dados.cor) erros.cor = MENSAGENS_VALIDACAO.corObrigatoria;
    if (!dados.textura) erros.textura = MENSAGENS_VALIDACAO.texturaObrigatoria;
    if (!dados.status) erros.status = MENSAGENS_VALIDACAO.statusObrigatorio;
    if (!dados.genero) erros.genero = MENSAGENS_VALIDACAO.sexoObrigatorio;
    if (!dados.condicao) erros.condicao = MENSAGENS_VALIDACAO.condicaoObrigatoria;
    if (dados.valorItem <= 0) erros.valorItem = MENSAGENS_VALIDACAO.precoInvalido;

    Object.entries(erros).forEach(([campo, mensagem]) => {
      setErro(campo as keyof TrajeRequest, mensagem);
    });

    return Object.keys(erros).length === 0;
  }, [setErro]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setField(name as keyof TrajeRequest, value);
    },
    [setField]
  );

  const handleValorItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { display, numeric } = formatarValorDigitado(e.target.value);
      setValorItemDisplay(display);
      setField('valorItem', numeric);
    },
    [setField]
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      handleFileChange(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [handleFileChange, setImagemPreview]
  );

  const handleRemoverImagem = useCallback(() => {
    handleRemover();
    setImagemPreview('');
    setModalImagemAberto(false);
  }, [handleRemover, setImagemPreview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validar(formData)) return;
      await onSubmit(formData);
    },
    [formData, validar, onSubmit]
  );

  const handleAtualizarImagem = useCallback(
    async (_trajeId: number, file: File): Promise<void> => {
      return new Promise((resolve) => {
        handleFileChange(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagemPreview(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    },
    [handleFileChange, setImagemPreview]
  );

  const renderSelect = useCallback(
    (name: keyof TrajeRequest, label: string, options: string[], obrigatorio = false) => {
      const erro = errosValidacao[name];
      const currentValue = formData[name] as string;
      const hasSelected = currentValue !== '';

      return (
        <div className={styles['formulario-traje__campo']}>
          <label htmlFor={name} className={styles['formulario-traje__label']}>
            {label} {obrigatorio && '*'}
          </label>
          <select
            id={name}
            name={name}
            value={currentValue}
            onChange={handleInputChange}
            className={`${styles['formulario-traje__select']} ${erro ? styles['formulario-traje__input--erro'] : ''}`}
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
          {erro && <span className={styles['formulario-traje__erro']}>{erro}</span>}
        </div>
      );
    },
    [errosValidacao, formData, handleInputChange, estaEnviando]
  );

  if (!opcoesEnum) {
    return <LoadingState mensagem="Carregando enums..." />;
  }

  return (
    <div className={styles['formulario-traje']}>
      <button
        className={styles['formulario-traje__voltar']}
        onClick={() => navigate(TRAJE_CONSTANTS.ROUTES.LISTA)}
        type="button"
      >
        ← Voltar
      </button>

      <section className={styles['formulario-traje__cabecalho']}>
        <h1 className={styles['formulario-traje__titulo']}>{titulo}</h1>
      </section>

      <form className={styles['formulario-traje__form']} onSubmit={handleSubmit}>
        <div className={styles['formulario-traje__conteudo']}>
          <div className={styles['formulario-traje__principal']}>
            <div className={styles['formulario-traje__linha-dois']}>
              <div className={styles['formulario-traje__campo']}>
                <label htmlFor="nome" className={styles['formulario-traje__label']}>
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`${styles['formulario-traje__input']} ${errosValidacao.nome ? styles['formulario-traje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                />
                {errosValidacao.nome && (
                  <span className={styles['formulario-traje__erro']}>{errosValidacao.nome}</span>
                )}
              </div>
            </div>

            <div className={`${styles['formulario-traje__campo']} ${styles['formulario-traje__campo--full']}`}>
              <label htmlFor="descricao" className={styles['formulario-traje__label']}>
                Descrição *
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className={`${styles['formulario-traje__textarea']} ${errosValidacao.descricao ? styles['formulario-traje__input--erro'] : ''}`}
                disabled={estaEnviando}
                rows={4}
              />
              {errosValidacao.descricao && (
                <span className={styles['formulario-traje__erro']}>{errosValidacao.descricao}</span>
              )}
            </div>

            <div className={styles['formulario-traje__linha-dois']}>
              {renderSelect('tecido', 'Tecido', opcoesEnum.tecido, true)}
              {renderSelect('cor', 'Cor', opcoesEnum.cor, true)}
            </div>

            <div className={styles['formulario-traje__linha-dois']}>
              {renderSelect('estampa', 'Estampa', opcoesEnum.estampa)}
              {renderSelect('tipo', 'Tipo do traje', opcoesEnum.tipoTraje, true)}
            </div>

            <div className={styles['formulario-traje__linha-tres']}>
              <div className={styles['formulario-traje__campo']}>
                <label htmlFor="valorItem" className={styles['formulario-traje__label']}>
                  Preço (R$) *
                </label>
                <input
                  type="text"
                  id="valorItem"
                  name="valorItem"
                  value={valorItemDisplay}
                  onChange={handleValorItemChange}
                  placeholder="0,00"
                  className={`${styles['formulario-traje__input']} ${errosValidacao.valorItem ? styles['formulario-traje__input--erro'] : ''}`}
                  disabled={estaEnviando}
                />
                {errosValidacao.valorItem && (
                  <span className={styles['formulario-traje__erro']}>{errosValidacao.valorItem}</span>
                )}
              </div>

              {renderSelect('tamanho', 'Tamanho', opcoesEnum.tamanho, true)}
              {renderSelect('textura', 'Textura', opcoesEnum.textura, true)}
            </div>

            <div className={styles['formulario-traje__linha-tres']}>
              {renderSelect('status', 'Status', opcoesEnum.status, true)}
              {renderSelect('genero', 'Sexo', opcoesEnum.sexo, true)}
              {renderSelect('condicao', 'Condição', opcoesEnum.condicao, true)}
            </div>
          </div>

          <aside className={styles['formulario-traje__preview']}>
            <div className={styles['formulario-traje__preview-card']}>
              <span className={styles['formulario-traje__preview-titulo']}>Imagem do traje</span>
              <div className={styles['formulario-traje__preview-wrapper']}>
                {imagemPreview ? (
                  <>
                    <img
                      src={imagemPreview}
                      alt="Pré-visualização do traje"
                      className={styles['formulario-traje__preview-imagem']}
                    />
                    <div className={styles['formulario-traje__preview-overlay']}>
                      <button
                        type="button"
                        className={styles['formulario-traje__preview-botao']}
                        onClick={() => setModalImagemAberto(true)}
                        title="Visualizar imagem"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        type="button"
                        className={`${styles['formulario-traje__preview-botao']} ${styles['formulario-traje__preview-botao--remover']}`}
                        onClick={handleRemoverImagem}
                        title="Remover imagem"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles['formulario-traje__preview-vazio']}>
                    Nenhuma imagem selecionada
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={estaEnviando}
                id="input-imagem"
                className={styles['formulario-traje__input-arquivo']}
              />
              <label htmlFor="input-imagem" className={styles['formulario-traje__label-arquivo']}>
                {imagemPreview ? 'Trocar Imagem' : 'Selecionar Imagem'}
              </label>
            </div>
          </aside>
        </div>

        {erro && <div className={styles['formulario-traje__erro-geral']}>{erro}</div>}

        <div className={styles['formulario-traje__botoes']}>
          <Botao tipo="secundario" onClick={() => navigate(TRAJE_CONSTANTS.ROUTES.LISTA)} disabled={estaEnviando}>
            Cancelar
          </Botao>
          <Botao tipo="primario" tipoHtml="submit" disabled={estaEnviando}>
            {estaEnviando ? 'Salvando...' : 'Salvar'}
          </Botao>
        </div>
      </form>

      <ModalVisualizacaoImagem
        imagemUrl={imagemPreview}
        trajeId={0}
        trajeNome={formData.nome || 'Traje'}
        estaAberto={modalImagemAberto}
        aoFechar={() => setModalImagemAberto(false)}
        aoAtualizarImagem={handleAtualizarImagem}
        aoRemoverImagem={async () => {
          handleRemoverImagem();
        }}
      />
    </div>
  );
}
