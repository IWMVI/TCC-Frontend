import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Dropdown } from 'react-bootstrap';
import { Edit2, Filter, MoreVertical } from 'lucide-react';
import {
  BadgeStatusValor,
  Botao,
  Card,
  Paginacao,
  MenuFiltrosLateral,
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
  PainelFiltroInput,
  Tabela,
} from '@/interfaces-graficas/componentes';
import { ListarFuncionariosUseCase } from '@/application/funcionarios';
import { FuncionarioApiRepository } from '@/infrastructure/api/FuncionarioApiRepository';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import acoesStyles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes.module.css';

const listarUseCase = new ListarFuncionariosUseCase(new FuncionarioApiRepository());

export function ListarFuncionarios() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState({ termo: '' });
  const [termoAplicado, setTermoAplicado] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const carregar = useCallback(async (busca?: string, pagina = 0) => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await listarUseCase.executar(busca, pagina, TAMANHO_PAGINA_PADRAO);
      setFuncionarios(resultado.content);
      setTotalPaginas(Math.max(resultado.totalPages, 1));
      setTotalRegistros(resultado.totalElements);
      setPaginaAtual(resultado.number);
    } catch {
      setErro('Erro ao carregar funcionários');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function buscarComFiltros() {
    setTermoAplicado(filtros.termo);
    setPainelFiltrosAberto(false);
    void carregar(filtros.termo || undefined, 0);
  }

  function limparFiltros() {
    setFiltros({ termo: '' });
    setTermoAplicado('');
    setPainelFiltrosAberto(false);
    void carregar(undefined, 0);
  }

  const colunas = [
    { chave: 'nome' as const, titulo: 'Nome' },
    { chave: 'email' as const, titulo: 'E-mail' },
    {
      chave: 'emailVerificado' as const,
      titulo: 'E-mail verificado',
      render: (f: FuncionarioResponse) => (f.emailVerificado ? 'Sim' : 'Não'),
    },
    {
      chave: 'acoes' as const,
      titulo: 'Ações',
      width: '80px',
      render: (f: FuncionarioResponse) => (
        <div className={acoesStyles['listar-clientes__acoes']}>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              size="sm"
              id={`acoes-funcionario-${f.id}`}
              className={acoesStyles['acao-toggle']}
              aria-label="Ações"
            >
              <MoreVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount popperConfig={{ strategy: 'fixed' }}>
              <Dropdown.Item onClick={() => navigate(`/funcionarios/${f.id}/editar`)}>
                <Edit2 size={14} className={acoesStyles['icone-editar']} />
                <span className={acoesStyles['acao-texto']}>Editar</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ),
    },
    {
      chave: 'ativo' as const,
      titulo: 'Status',
      render: (f: FuncionarioResponse) => (
        <BadgeStatusValor status={f.ativo ? 'Ativo' : 'Inativo'} />
      ),
    },
  ];

  return (
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Funcionários</h1>
          <p>Gerencie os acessos ao sistema</p>
        </div>
        <div className={paginaListagemStyles['pagina-listagem__acoes']}>
          <Botao tipo="secundario" onClick={() => setPainelFiltrosAberto(true)}>
            <Filter size={16} />
            Filtros
          </Botao>
          <Link to="/funcionarios/novo">
            <Botao>Novo Funcionário</Botao>
          </Link>
        </div>
      </header>

      <MenuFiltrosLateral
        aberto={painelFiltrosAberto}
        onFechar={() => setPainelFiltrosAberto(false)}
      >
        <PainelFiltro variante="lateral">
          <PainelFiltroControles>
            <PainelFiltroCampo id="filtro-funcionario-termo" label="Busca">
              <PainelFiltroInput
                id="filtro-funcionario-termo"
                type="text"
                value={filtros.termo}
                placeholder="Nome ou e-mail..."
                onChange={(e) => setFiltros({ termo: e.target.value })}
              />
            </PainelFiltroCampo>
          </PainelFiltroControles>
          <PainelFiltroAcoes
            onBuscar={buscarComFiltros}
            onLimpar={limparFiltros}
            carregando={carregando}
          />
        </PainelFiltro>
      </MenuFiltrosLateral>

      <Card preencheAltura>
        <div className={paginaListagemStyles['pagina-listagem__area-card']}>
            {erro && (
              <Alert variant="danger" dismissible onClose={() => setErro(null)}>
                {erro}
              </Alert>
            )}

            <div className={paginaListagemStyles['pagina-listagem__tabela']}>
              <Tabela
                colunas={colunas}
                dados={funcionarios}
                estaCarregando={carregando}
                linhasPorPagina={TAMANHO_PAGINA_PADRAO}
              />
            </div>

          <div className={paginaListagemStyles['pagina-listagem__paginacao']}>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas || 1}
              totalRegistros={totalRegistros}
              tamanhoPagina={TAMANHO_PAGINA_PADRAO}
              onPageChange={(p) => void carregar(termoAplicado || undefined, p)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
