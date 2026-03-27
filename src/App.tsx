import {Navigate, Route, Routes} from 'react-router-dom';
import {Layout} from './interfaces-graficas/componentes/layout/Layout';
import {Dashboard} from './interfaces-graficas/paginas/dashboard/Dashboard';
import {Clientes} from './interfaces-graficas/paginas/clientes/Clientes';
import {ListarClientes} from './interfaces-graficas/paginas/clientes/listar/ListarClientes';
import {CriarCliente} from './interfaces-graficas/paginas/clientes/criar/CriarCliente';
import {EditarCliente} from './interfaces-graficas/paginas/clientes/editar/EditarCliente';
import {Trajes} from './interfaces-graficas/paginas/trajes/Trajes';
import {Alugueis} from './interfaces-graficas/paginas/alugueis/Alugueis';
import {ProvedorClientes} from './interfaces-graficas/contextos';

function App() {
  return (
    <ProvedorClientes>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<Clientes/>}/>
          <Route path="clientes/listar" element={<ListarClientes/>}/>
          <Route path="clientes/novo" element={<CriarCliente />} />
          <Route path="clientes/:id/editar" element={<EditarCliente />} />
          <Route path="trajes" element={<Trajes />} />
          <Route path="alugueis" element={<Alugueis />} />
        </Route>
      </Routes>
    </ProvedorClientes>
  );
}

export default App;
