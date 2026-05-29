import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { CriarFuncionarioUseCase } from '@/application/funcionarios';
import { FuncionarioApiRepository } from '@/infrastructure/api/FuncionarioApiRepository';
import {
  FuncionarioRequest,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';
import { FormularioFuncionario } from '@/interfaces-graficas/paginas/funcionarios/componentes/FormularioFuncionario/FormularioFuncionario';
import { Card } from '@/interfaces-graficas/componentes/layout/Card';
import { useConfirmarCancelarCadastro } from '@/interfaces-graficas/hooks/useConfirmarCancelarCadastro';
import listagemStyles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes.module.css';

const criarUseCase = new CriarFuncionarioUseCase(new FuncionarioApiRepository());

export function CriarFuncionario() {
  const navigate = useNavigate();
  const { solicitarCancelamento, modalConfirmacao } = useConfirmarCancelarCadastro(() => {
    navigate('/dashboard');
  });
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(
    dados: FuncionarioRequest | FuncionarioUpdateRequest,
  ) {
    const payload = dados as FuncionarioRequest;
    setErro(null);
    setEstaEnviando(true);
    try {
      await criarUseCase.executar(payload);
      setSucesso(true);
      setTimeout(() => navigate('/funcionarios/listar'), 2500);
    } catch {
      setErro('Não foi possível cadastrar o funcionário.');
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className={listagemStyles['listar-clientes']}>
      <header className={listagemStyles['listar-clientes__header']}>
        <div className={listagemStyles['listar-clientes__titulo']}>
          <h1>Novo funcionário</h1>
          <p>Cadastro com confirmação por e-mail</p>
        </div>
      </header>

      {sucesso && (
        <Alert variant="success">
          Funcionário cadastrado. E-mail de confirmação enviado.
        </Alert>
      )}

      {erro && <Alert variant="danger">{erro}</Alert>}

      {!sucesso && (
        <Card titulo="Dados do funcionário">
          <FormularioFuncionario
            estaEnviando={estaEnviando}
            onSubmit={handleSubmit}
            onCancelar={solicitarCancelamento}
          />
        </Card>
      )}
      {modalConfirmacao}
    </div>
  );
}
