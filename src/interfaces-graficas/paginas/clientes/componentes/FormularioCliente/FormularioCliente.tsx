import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao, Card, CampoFormulario } from '../../../../componentes';
import { ClienteRequest, SiglaEstado } from '../../../../../domain/entidades';
import { mascararCpfCnpj, mascararCelular, mascararCep } from '../../../../utils/formatacoes';
import styles from './FormularioCliente.module.css';

interface FormularioClienteProps {
  titulo: string;
  descricao: string;
  initialData?: Partial<ClienteRequest>;
  estaEnviando: boolean;
  erro: string | null;
  onSubmit: (dados: ClienteRequest) => Promise<void>;
}

const estados = Object.values(SiglaEstado);

export function FormularioCliente({
  titulo,
  descricao,
  initialData,
  estaEnviando,
  erro,
  onSubmit,
}: FormularioClienteProps) {
  const navigate = useNavigate();

  const [nome, setNome] = useState(initialData?.nome || '');
  const [cpfCnpj, setCpfCnpj] = useState(initialData?.cpfCnpj || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [celular, setCelular] = useState(initialData?.celular || '');
  const [cep, setCep] = useState(initialData?.endereco?.cep || '');
  const [logradouro, setLogradouro] = useState(initialData?.endereco?.logradouro || '');
  const [numero, setNumero] = useState(initialData?.endereco?.numero || '');
  const [bairro, setBairro] = useState(initialData?.endereco?.bairro || '');
  const [cidade, setCidade] = useState(initialData?.endereco?.cidade || '');
  const [estado, setEstado] = useState<SiglaEstado>(
    (initialData?.endereco?.estado as SiglaEstado) || SiglaEstado.SP
  );
  const [complemento, setComplemento] = useState(initialData?.endereco?.complemento || '');

  function handleCepChange(valor: string) {
    setCep(mascararCep(valor));
  }

  function handleCepBlur() {
    const cepNumerico = cep.replace(/\D/g, '');
    if (cepNumerico.length === 8) {
      buscarEnderecoPorCep(cep);
    }
  }

  async function buscarEnderecoPorCep(cepFormatado: string) {
    const cepNumerico = cepFormatado.replace(/\D/g, '');
    if (cepNumerico.length !== 8) return;

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
      const dados = await resposta.json();

      if (!dados.erro) {
        setLogradouro(dados.logradouro || '');
        setBairro(dados.bairro || '');
        setCidade(dados.localidade || '');
        setEstado(dados.uf as SiglaEstado);
      }
    } catch {
      console.error('Erro ao buscar CEP');
    }
  }

  function handleCpfCnpjChange(valor: string) {
    setCpfCnpj(mascararCpfCnpj(valor));
  }

  function handleCelularChange(valor: string) {
    setCelular(mascararCelular(valor));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dados: ClienteRequest = {
      nome,
      cpfCnpj: cpfCnpj.replace(/\D/g, ''),
      email,
      celular: celular.replace(/\D/g, ''),
      endereco: {
        cep: cep.replace(/\D/g, ''),
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        complemento,
      },
    };

    await onSubmit(dados);
  }

  return (
    <div className={styles['formulario-cliente']}>
      <header className={styles['formulario-cliente__header']}>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </header>

      <Card titulo="Dados do Cliente">
        <form onSubmit={handleSubmit} className={styles['formulario-cliente__form']}>
          {erro && <div className={styles['formulario-cliente__erro']}>{erro}</div>}

          <div className={styles['formulario-cliente__grid']}>
            <CampoFormulario
              label="Nome"
              nome="nome"
              valor={nome}
              onChange={setNome}
              obrigatorio
              placeholder="Nome completo"
            />
            <CampoFormulario
              label="CPF/CNPJ"
              nome="cpfCnpj"
              valor={cpfCnpj}
              onChange={handleCpfCnpjChange}
              obrigatorio
              placeholder="000.000.000-00"
              maxLength={18}
            />
            <CampoFormulario
              label="E-mail"
              nome="email"
              tipo="email"
              valor={email}
              onChange={setEmail}
              obrigatorio
              placeholder="email@exemplo.com"
            />
            <CampoFormulario
              label="Celular"
              nome="celular"
              tipo="tel"
              valor={celular}
              onChange={handleCelularChange}
              obrigatorio
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>

          <h3 className={styles['formulario-cliente__subtitulo']}>Endereço</h3>

          <div className={styles['formulario-cliente__grid']}>
            <CampoFormulario
              label="CEP"
              nome="cep"
              valor={cep}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              maxLength={9}
            />
            <CampoFormulario
              label="Logradouro"
              nome="logradouro"
              valor={logradouro}
              onChange={setLogradouro}
              placeholder="Rua, avenida, etc."
            />
            <CampoFormulario
              label="Número"
              nome="numero"
              valor={numero}
              onChange={setNumero}
              placeholder="123"
            />
            <CampoFormulario
              label="Bairro"
              nome="bairro"
              valor={bairro}
              onChange={setBairro}
              placeholder="Bairro"
            />
            <CampoFormulario
              label="Cidade"
              nome="cidade"
              valor={cidade}
              onChange={setCidade}
              placeholder="Cidade"
            />
            <div className={styles['formulario-cliente__campo']}>
              <label htmlFor="estado" className={styles['formulario-cliente__label']}>
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className={styles['formulario-cliente__select']}
                value={estado}
                onChange={(e) => setEstado(e.target.value as SiglaEstado)}
              >
                {estados.map((sigla) => (
                  <option key={sigla} value={sigla}>
                    {sigla}
                  </option>
                ))}
              </select>
            </div>
            <CampoFormulario
              label="Complemento"
              nome="complemento"
              valor={complemento}
              onChange={setComplemento}
              placeholder="Apto, sala, etc."
            />
          </div>

          <div className={styles['formulario-cliente__acoes']}>
            <Botao tipo="secundario" onClick={() => navigate('/clientes')} disabled={estaEnviando}>
              Cancelar
            </Botao>
            <Botao tipo="primario" tipoHtml="submit" disabled={estaEnviando}>
              {estaEnviando ? 'Salvando...' : 'Salvar'}
            </Botao>
          </div>
        </form>
      </Card>
    </div>
  );
}
