import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './interfaces-graficas/componentes/Layout';
import { Dashboard } from './interfaces-graficas/paginas/dashboard/Dashboard';
import { ListarClientes } from './interfaces-graficas/paginas/clientes/ListarClientes';
import { CriarCliente } from './interfaces-graficas/paginas/clientes/CriarCliente';
import { EditarCliente } from './interfaces-graficas/paginas/clientes/EditarCliente';
import { ProvedorClientes } from './interfaces-graficas/contextos';

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
