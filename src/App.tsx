import {Navigate, Route, Routes} from 'react-router-dom';
import {Layout} from './interfaces-graficas/componentes/layout/Layout';
import {Dashboard} from './interfaces-graficas/paginas/dashboard/Dashboard';
import {ListarClientes} from './interfaces-graficas/paginas/clientes/listar/ListarClientes';
import {CriarCliente} from './interfaces-graficas/paginas/clientes/criar/CriarCliente';
import {EditarCliente} from './interfaces-graficas/paginas/clientes/editar/EditarCliente';
import {ProvedorClientes} from './interfaces-graficas/contextos';

function App() {
  return (
    <ProvedorClientes>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<ListarClientes />} />
          <Route path="clientes/novo" element={<CriarCliente />} />
          <Route path="clientes/:id/editar" element={<EditarCliente />} />
        </Route>
      </Routes>
    </ProvedorClientes>
  );
}

export default App;
