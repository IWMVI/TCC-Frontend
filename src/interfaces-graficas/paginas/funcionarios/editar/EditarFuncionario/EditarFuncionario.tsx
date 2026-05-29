import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import {
  AtualizarFuncionarioUseCase,
  BuscarFuncionarioPorIdUseCase,
} from '@/application/funcionarios';
import { FuncionarioApiRepository } from '@/infrastructure/api/FuncionarioApiRepository';
import { FuncionarioUpdateRequest } from '@/domain/entidades/Funcionario';
import { FormularioFuncionario } from '@/interfaces-graficas/paginas/funcionarios/componentes/FormularioFuncionario/FormularioFuncionario';
import { Card } from '@/interfaces-graficas/componentes/layout/Card';
import listagemStyles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes.module.css';

const repositorio = new FuncionarioApiRepository();
const buscarUseCase = new BuscarFuncionarioPorIdUseCase(repositorio);
const atualizarUseCase = new AtualizarFuncionarioUseCase(repositorio);

export function EditarFuncionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      if (!id) return;
      try {
        const funcionario = await buscarUseCase.executar(Number(id));
        setNome(funcionario.nome);
        setEmail(funcionario.email);
      } catch {
        setErro('Funcionário não encontrado');
      } finally {
        setCarregando(false);
      }
    }
    void carregar();
  }, [id]);

  async function handleSubmit(dados: FuncionarioUpdateRequest) {
    if (!id) return;
    setEstaEnviando(true);
    setErro(null);
    try {
      await atualizarUseCase.executar(Number(id), dados);
      navigate('/funcionarios/listar');
    } catch {
      setErro('Não foi possível atualizar o funcionário.');
    } finally {
      setEstaEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className={listagemStyles['listar-clientes']}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={listagemStyles['listar-clientes']}>
      <header className={listagemStyles['listar-clientes__header']}>
        <div className={listagemStyles['listar-clientes__titulo']}>
          <h1>Editar funcionário</h1>
          <p>Atualize nome, e-mail ou senha</p>
        </div>
      </header>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <Card titulo="Dados do funcionário">
        <FormularioFuncionario
          modoEdicao
          valoresIniciais={{ nome, email }}
          estaEnviando={estaEnviando}
          onSubmit={handleSubmit}
          onCancelar={() => navigate('/funcionarios/listar')}
        />
      </Card>
    </div>
  );
}
