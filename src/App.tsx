import {Navigate, Route, Routes} from 'react-router-dom';
import {Layout} from '@/interfaces-graficas/componentes/layout/Layout';
import {Dashboard} from '@/interfaces-graficas/paginas/dashboard/Dashboard';
import {Clientes} from '@/interfaces-graficas/paginas/clientes/Clientes';
import {ListarClientes} from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes';
import {ListarClientesExcluidos} from '@/interfaces-graficas/paginas/clientes/listar/ListarClientesExcluidos/ListarClientesExcluidos';
import {CriarCliente} from '@/interfaces-graficas/paginas/clientes/criar/CriarCliente';
import {EditarCliente} from '@/interfaces-graficas/paginas/clientes/editar/EditarCliente';
import {Trajes} from '@/interfaces-graficas/paginas/trajes/Trajes';
import {ListarTrajes} from '@/interfaces-graficas/paginas/trajes/listar/ListarTrajes';
import {CriarTraje} from '@/interfaces-graficas/paginas/trajes/criar/CriarTraje';
import {EditarTraje} from '@/interfaces-graficas/paginas/trajes/editar/EditarTraje';
import {Alugueis} from '@/interfaces-graficas/paginas/alugueis/Alugueis';
import {RealizarAluguel} from '@/interfaces-graficas/paginas/alugueis/realizar';
import {ListarAluguel} from '@/interfaces-graficas/paginas/alugueis/listar';
import {EditarAluguel} from '@/interfaces-graficas/paginas/alugueis/editar';
import {ProvedorClientes, ProvedorTrajes} from '@/interfaces-graficas/contextos';

function App() {
  return (
    <ProvedorClientes>
      <ProvedorTrajes>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clientes/>}/>
            <Route path="clientes/listar" element={<ListarClientes/>}/>
            <Route path="clientes/excluidos" element={<ListarClientesExcluidos/>}/>
            <Route path="clientes/novo" element={<CriarCliente />} />
            <Route path="clientes/:id/editar" element={<EditarCliente />} />
            <Route path="trajes" element={<Trajes />} />
            <Route path="trajes/listar" element={<ListarTrajes />} />
            <Route path="trajes/novo" element={<CriarTraje />} />
            <Route path="trajes/:id/editar" element={<EditarTraje />} />
            <Route path="alugueis" element={<Alugueis />} />
            <Route path="alugueis/novo" element={<RealizarAluguel />} />
            <Route path="alugueis/listar" element={<ListarAluguel />} />
            <Route path="alugueis/:id/editar" element={<EditarAluguel />} />
          </Route>
        </Routes>
      </ProvedorTrajes>
    </ProvedorClientes>
  );
}

export default App;
