import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao, Card, CampoFormulario } from '../../componentes';
import { CriarClienteUseCase } from '../../../application/clientes';
import { ClienteApiRepositorio } from '../../../infrastructure/api';
import { ClienteRequest, SiglaEstado } from '../../../domain/entidades';
import { mascararCpfCnpj, mascararCelular, mascararCep } from '../../utils/formatacoes';
import './FormularioCliente.css';

const clienteRepositorio = new ClienteApiRepositorio();
const criarClienteUseCase = new CriarClienteUseCase(clienteRepositorio);

export function CriarCliente() {
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState<SiglaEstado>(SiglaEstado.SP);
  const [complemento, setComplemento] = useState('');

  const estados = Object.values(SiglaEstado);

  function handleCepChange(valor: string) {
    const mascarado = mascararCep(valor);
    setCep(mascarado);
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
    setErro(null);
    setEstaEnviando(true);

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

    try {
      await criarClienteUseCase.executar(dados);
      navigate('/clientes');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className="formulario-cliente">
      <header className="formulario-cliente__header">
        <h1>Novo Cliente</h1>
        <p>Cadastre um novo cliente no sistema</p>
      </header>

      <Card titulo="Dados do Cliente">
        <form onSubmit={handleSubmit} className="formulario-cliente__form">
          {erro && <div className="formulario-cliente__erro">{erro}</div>}

          <div className="formulario-cliente__grid">
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

          <h3 className="formulario-cliente__subtitulo">Endereço</h3>

          <div className="formulario-cliente__grid">
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
            <div className="formulario-cliente__campo">
              <label htmlFor="estado" className="formulario-cliente__label">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="formulario-cliente__select"
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

          <div className="formulario-cliente__acoes">
            <Botao
              tipo="secundario"
              onClick={() => navigate('/clientes')}
              disabled={estaEnviando}
            >
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
