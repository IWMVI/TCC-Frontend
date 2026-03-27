import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Botao} from '../../../../componentes/base/Botao';
import {ClienteRequest, SiglaEstado} from '../../../../../domain/entidades';
import {ClienteApiRepositorio} from '../../../../../infrastructure/api';
import {mascararCelular, mascararCep, mascararCpfCnpj, mascararTelefone,} from '../../../../utils/formatacoes';
import styles from './FormularioCliente.module.css';

const medidaApi = new ClienteApiRepositorio();

type Sexo = 'masculino' | 'feminino';

interface Medida {
    campo: string;
    label: string;
}

const MEDIDAS_FEMININAS: Medida[] = [
    {campo: 'cintura', label: 'Cintura'},
    {campo: 'manga', label: 'Manga'},
    {campo: 'alturaBusto', label: 'Altura Busto'},
    {campo: 'raioBusto', label: 'Raio Busto'},
    {campo: 'corpo', label: 'Corpo'},
    {campo: 'ombro', label: 'Ombro'},
    {campo: 'decote', label: 'Decote'},
    {campo: 'quadril', label: 'Quadril'},
    {campo: 'comprimentoVestido', label: 'Comp. Vestido'},
];

const MEDIDAS_MASCULINAS: Medida[] = [
    {campo: 'cintura', label: 'Cintura'},
    {campo: 'manga', label: 'Manga'},
    {campo: 'colarinho', label: 'Colarinho'},
    {campo: 'barra', label: 'Barra'},
    {campo: 'torax', label: 'Tórax'},
];

const ESTADOS = Object.values(SiglaEstado);

function formatarMedida(c: number): string {
    const s = String(c ?? 0).padStart(3, '0');
    return `${s.slice(0, -2)},${s.slice(-2)}`;
}

interface Erros {
    cpfCnpj?: string;
    nome?: string;
    email?: string;
    celular?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    cidade?: string;
    bairro?: string;
}

interface FormularioClienteProps {
  titulo: string;
    initialData?: Partial<ClienteRequest> & {
        sexo?: 'MASCULINO' | 'FEMININO';
        medidas?: Record<string, number>;
        medidaId?: number;
    };
  estaEnviando: boolean;
  erro: string | null;
    onSubmit: (dados: ClienteRequest) => Promise<number | void>;
    clienteId?: number;
}

export function FormularioCliente({
  titulo,
  initialData,
  estaEnviando,
  erro,
  onSubmit,
                                      clienteId,
                                  }: Readonly<FormularioClienteProps>) {
  const navigate = useNavigate();

    const [sexo, setSexo] = useState<Sexo>(
        initialData?.sexo === 'MASCULINO' ? 'masculino' : 'feminino'
    );
    const [nome, setNome] = useState(initialData?.nome ?? '');
    const [cpfCnpj, setCpfCnpj] = useState(initialData?.cpfCnpj ?? '');
    const [email, setEmail] = useState(initialData?.email ?? '');
    const [celular, setCelular] = useState(
        initialData?.celular ? mascararCelular(initialData.celular) : ''
    );
    const [fixo, setFixo] = useState('');
    const [cep, setCep] = useState(initialData?.endereco?.cep ?? '');
    const [logradouro, setLogradouro] = useState(initialData?.endereco?.logradouro ?? '');
    const [numero, setNumero] = useState(initialData?.endereco?.numero ?? '');
    const [bairro, setBairro] = useState(initialData?.endereco?.bairro ?? '');
    const [cidade, setCidade] = useState(initialData?.endereco?.cidade ?? '');
  const [estado, setEstado] = useState<SiglaEstado>(
      (initialData?.endereco?.estado as SiglaEstado) ?? SiglaEstado.SP
  );
    const [complemento, setComplemento] = useState(initialData?.endereco?.complemento ?? '');
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [erroCep, setErroCep] = useState('');
    const [medidas, setMedidas] = useState<Record<string, number>>({});
    const [erros, setErros] = useState<Erros>({});
    const [tentouSalvar, setTentouSalvar] = useState(false);

    // Revalida em tempo real após primeira tentativa de salvar
    useEffect(() => {
        if (tentouSalvar) setErros(validar());
    }, [cpfCnpj, nome, email, celular, cep, logradouro, numero, cidade, bairro, tentouSalvar]);

    // Inicializa medidas a partir do initialData
    useEffect(() => {
        if (initialData?.medidas) {
            setMedidas(initialData.medidas);
        }
    }, [initialData?.medidas]);

    // Mapeia erro da API para o campo correspondente
    const erroApi = erro ? mapearErroApi(erro) : {};

    function mapearErroApi(msg: string): Erros {
        const m = msg.toLowerCase();
        if (m.includes('email')) return {email: msg};
        if (m.includes('cpf') || m.includes('cnpj')) return {cpfCnpj: msg};
        if (m.includes('celular') || m.includes('telefone')) return {celular: msg};
        if (m.includes('nome')) return {nome: msg};
        if (m.includes('cep')) return {cep: msg};
        return {};
  }

    const errosCombinados: Erros = {...erroApi, ...erros};

    function handleMedidaKeyDown(campo: string, e: React.KeyboardEvent<HTMLElement>) {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            setMedidas((prev) => {
                const atual = prev[campo] ?? 0;
                const novo = atual * 10 + Number(e.key);
                return novo > 99999 ? prev : {...prev, [campo]: novo};
            });
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            setMedidas((prev) => ({...prev, [campo]: Math.floor((prev[campo] ?? 0) / 10)}));
        }
    }

    async function buscarCep() {
        const cepNum = cep.replaceAll(/\D/g, '');
        if (cepNum.length !== 8) return;
        setBuscandoCep(true);
        setErroCep('');
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
        const dados = await res.json();
        if (dados.erro) {
            setErroCep('CEP não encontrado');
        } else {
            setLogradouro(dados.logradouro ?? '');
            setBairro(dados.bairro ?? '');
            setCidade(dados.localidade ?? '');
        setEstado(dados.uf as SiglaEstado);
      }
    } catch {
        setErroCep('Erro ao buscar CEP');
    } finally {
        setBuscandoCep(false);
    }
  }

    function validar(): Erros {
        const e: Erros = {};
        if (!cpfCnpj.trim()) e.cpfCnpj = 'CPF/CNPJ obrigatório';
        if (!nome.trim()) e.nome = 'Nome obrigatório';
        if (!email.trim()) e.email = 'E-mail obrigatório';
        if (!celular.trim()) e.celular = 'Celular obrigatório';
        if (!cep.trim()) e.cep = 'CEP obrigatório';
        if (!logradouro.trim()) e.logradouro = 'Endereço obrigatório';
        if (!numero.trim()) e.numero = 'Número obrigatório';
        if (!cidade.trim()) e.cidade = 'Cidade obrigatória';
        if (!bairro.trim()) e.bairro = 'Bairro obrigatório';
        return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
      setTentouSalvar(true);
      const novosErros = validar();
      setErros(novosErros);
      if (Object.keys(novosErros).length > 0) return;

      const dadosCliente: ClienteRequest = {
      nome,
          cpfCnpj: cpfCnpj.replaceAll(/\D/g, ''),
      email,
          celular: celular.replaceAll(/\D/g, ''),
          sexo: sexo === 'masculino' ? 'MASCULINO' : 'FEMININO',
      endereco: {
          cep: cep.replaceAll(/\D/g, ''),
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        complemento,
      },
    };

      const clienteIdSalvo = await onSubmit(dadosCliente);

      // Salva medidas se clienteId disponível e alguma medida foi preenchida
      const temMedidas = Object.values(medidas).some((v) => v > 0);
      const medidaId = initialData?.medidaId;
      const idParaMedidas = clienteIdSalvo ?? clienteId;

      if (idParaMedidas && temMedidas) {
          const centToDecimal = (c: number) => parseFloat((c / 100).toFixed(2));
          try {
              if (sexo === 'feminino') {
                  if (medidaId) {
                      await medidaApi.atualizarMedidasFeminina(
                          {
                              clienteId: idParaMedidas,
                              cintura: centToDecimal(medidas['cintura'] ?? 0),
                              manga: centToDecimal(medidas['manga'] ?? 0),
                              alturaBusto: centToDecimal(medidas['alturaBusto'] ?? 0),
                              raioBusto: centToDecimal(medidas['raioBusto'] ?? 0),
                              corpo: centToDecimal(medidas['corpo'] ?? 0),
                              ombro: centToDecimal(medidas['ombro'] ?? 0),
                              decote: centToDecimal(medidas['decote'] ?? 0),
                              quadril: centToDecimal(medidas['quadril'] ?? 0),
                              comprimentoVestido: centToDecimal(medidas['comprimentoVestido'] ?? 0),
                          },
                          medidaId
                      );
                  } else {
                      await medidaApi.criarMedidaFeminina({
                          clienteId: idParaMedidas,
                          cintura: centToDecimal(medidas['cintura'] ?? 0),
                          manga: centToDecimal(medidas['manga'] ?? 0),
                          alturaBusto: centToDecimal(medidas['alturaBusto'] ?? 0),
                          raioBusto: centToDecimal(medidas['raioBusto'] ?? 0),
                          corpo: centToDecimal(medidas['corpo'] ?? 0),
                          ombro: centToDecimal(medidas['ombro'] ?? 0),
                          decote: centToDecimal(medidas['decote'] ?? 0),
                          quadril: centToDecimal(medidas['quadril'] ?? 0),
                          comprimentoVestido: centToDecimal(medidas['comprimentoVestido'] ?? 0),
                      });
                  }
              } else {
                  if (medidaId) {
                      await medidaApi.atualizarMedidasMasculina(
                          {
                              clienteId: idParaMedidas,
                              cintura: centToDecimal(medidas['cintura'] ?? 0),
                              manga: centToDecimal(medidas['manga'] ?? 0),
                              colarinho: centToDecimal(medidas['colarinho'] ?? 0),
                              barra: centToDecimal(medidas['barra'] ?? 0),
                              torax: centToDecimal(medidas['torax'] ?? 0),
                          },
                          medidaId
                      );
                  } else {
                      await medidaApi.criarMedidaMasculina({
                          clienteId: idParaMedidas,
                          cintura: centToDecimal(medidas['cintura'] ?? 0),
                          manga: centToDecimal(medidas['manga'] ?? 0),
                          colarinho: centToDecimal(medidas['colarinho'] ?? 0),
                          barra: centToDecimal(medidas['barra'] ?? 0),
                          torax: centToDecimal(medidas['torax'] ?? 0),
                      });
                  }
              }
          } catch {
              // medidas falham silenciosamente — cliente já foi salvo
          }
      }
  }

    const listaMedidas = sexo === 'feminino' ? MEDIDAS_FEMININAS : MEDIDAS_MASCULINAS;

    function campo(
        id: string,
        label: string,
        value: string,
        onChange: (v: string) => void,
        opts?: {
            placeholder?: string;
            maxLength?: number;
            tipo?: string;
            onBlur?: () => void;
            disabled?: boolean;
            obrigatorio?: boolean;
        }
    ) {
        const erroMsg = errosCombinados[id as keyof Erros];
        return (
            <div className={styles.fc__campo}>
                <label className={styles.fc__label} htmlFor={id}>
                    {label}
                    {opts?.obrigatorio && <span className={styles.fc__obrigatorio}>*</span>}
                </label>
                <input
                    id={id}
                    name={id}
                    type={opts?.tipo ?? 'text'}
                    className={`${styles.fc__input} ${tentouSalvar && erroMsg ? styles['fc__input--erro'] : ''}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={opts?.onBlur}
                    placeholder={opts?.placeholder}
                    maxLength={opts?.maxLength}
                    disabled={opts?.disabled}
                    autoComplete="off"
                />
                {tentouSalvar && erroMsg && <span className={styles.fc__erro_campo}>{erroMsg}</span>}
            </div>
        );
    }

    return (
        <div className={styles.fc}>
            <h1 className={styles.fc__titulo}>{titulo}</h1>

            <form onSubmit={handleSubmit} className={styles.fc__form} noValidate>
                {/* ── Coluna esquerda ── */}
                <div className={styles.fc__esquerda}>
                    <div className={styles.fc__painel}>
                        {/* CPF/CNPJ */}
                        {campo('cpfCnpj', 'CPF / CNPJ', cpfCnpj, (v) => setCpfCnpj(mascararCpfCnpj(v)), {
                            placeholder: '000.000.000-00',
                            maxLength: 18,
                            obrigatorio: true,
                        })}

                        {/* Nome */}
                        {campo('nome', 'Nome', nome, setNome, {obrigatorio: true})}

                        {/* Sexo */}
                        <div className={styles.fc__campo}>
                            <span className={styles.fc__label}>Sexo</span>
                            <div className={styles.fc__radios}>
                                {(['masculino', 'feminino'] as Sexo[]).map((v) => (
                                    <label key={v} className={styles.fc__radio}>
                                        <input
                                            type="radio"
                                            name="sexo"
                                            value={v}
                                            checked={sexo === v}
                                            onChange={() => setSexo(v)}
                                        />
                                        {v === 'masculino' ? 'Masculino' : 'Feminino'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fc__divisor}/>

                        {/* CEP + Endereço */}
                        <div className={styles['fc__linha-cep']}>
                            <div className={styles.fc__campo}>
                                <label className={styles.fc__label} htmlFor="cep">
                                    CEP<span className={styles.fc__obrigatorio}>*</span>
                                </label>
                                <input
                                    id="cep"
                                    name="cep"
                                    type="text"
                                    className={`${styles.fc__input} ${tentouSalvar && errosCombinados.cep ? styles['fc__input--erro'] : ''}`}
                                    value={cep}
                                    onChange={(e) => {
                                        setCep(mascararCep(e.target.value));
                                        setErroCep('');
                                    }}
                                    onBlur={buscarCep}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    disabled={buscandoCep}
                                />
                                {tentouSalvar && errosCombinados.cep && (
                                    <span className={styles.fc__erro_campo}>{errosCombinados.cep}</span>
                                )}
                                {erroCep && <span className={styles.fc__erro_campo}>{erroCep}</span>}
                            </div>
                            {campo('logradouro', 'Endereço', logradouro, setLogradouro, {obrigatorio: true})}
                        </div>

                        <div className={styles['fc__linha-3']}>
                            {campo('numero', 'Num.', numero, setNumero, {obrigatorio: true})}
                            {campo('cidade', 'Cidade', cidade, setCidade, {obrigatorio: true})}
                            {campo('bairro', 'Bairro', bairro, setBairro, {obrigatorio: true})}
                        </div>

                        <div className={styles['fc__linha-compl']}>
                            {campo('complemento', 'Compl.', complemento, setComplemento)}
                            <div className={styles.fc__campo}>
                                <label className={styles.fc__label} htmlFor="estado">
                                    U.F<span className={styles.fc__obrigatorio}>*</span>
                                </label>
                                <select
                                    id="estado"
                                    name="estado"
                                    value={estado}
                                    className={styles.fc__select}
                                    onChange={(e) => setEstado(e.target.value as SiglaEstado)}
                                >
                                    {ESTADOS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.fc__divisor}/>

                        {/* E-mail */}
                        {campo('email', 'E-mail', email, setEmail, {tipo: 'email', obrigatorio: true})}

                        {/* Telefones */}
                        <div className={styles['fc__linha-2']}>
                            {campo('celular', 'Celular', celular, (v) => setCelular(mascararCelular(v)), {
                                placeholder: '(00) 00000-0000',
                                maxLength: 15,
                                obrigatorio: true,
                            })}
                            {campo('fixo', 'Fixo', fixo, (v) => setFixo(mascararTelefone(v)), {
                                placeholder: '(00) 0000-0000',
                                maxLength: 14,
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Coluna direita: medidas ── */}
                <div className={styles.fc__direita}>
                    <div className={styles['fc__medidas-bloco']}>
                        <p className={styles['fc__medidas-titulo']}>
                            Medidas <span className={styles['fc__medidas-unidade']}>em cm</span>
                        </p>
                        <div
                            className={`${styles.fc__medidas} ${listaMedidas.length <= 6 ? styles['fc__medidas--2col'] : ''}`}
                        >
                            {listaMedidas.map(({campo: c, label}, i) => {
                                const ativo = (medidas[c] ?? 0) > 0;
                                return (
                                    <div
                                        key={c}
                                        className={`${styles['fc__medida-card']} ${listaMedidas.length <= 6 && i === listaMedidas.length - 1 ? styles['fc__medida-card--full'] : ''}`}
                                        tabIndex={0}
                                        role="spinbutton"
                                        aria-label={`${label}: ${formatarMedida(medidas[c] ?? 0)}`}
                                        onKeyDown={(e) => handleMedidaKeyDown(c, e)}
                                    >
                                        <span className={styles['fc__medida-card__label']}>{label}</span>
                                        <span
                                            className={`${styles['fc__medida-card__valor']} ${ativo ? styles['fc__medida-card__valor--ativo'] : ''}`}
                                        >
                      {formatarMedida(medidas[c] ?? 0)}
                    </span>
                                        <span className={styles['fc__medida-card__hint']}>Informe a medida</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Rodapé ── */}
                <div className={styles.fc__acoes}>
                    <Botao tipo="secundario" onClick={() => navigate('/clientes')} disabled={estaEnviando}>
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
