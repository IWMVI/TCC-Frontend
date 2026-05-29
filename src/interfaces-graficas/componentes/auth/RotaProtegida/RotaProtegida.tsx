import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacao } from '@/interfaces-graficas/contextos/ContextoAutenticacao';

export function RotaProtegida() {
  const { autenticado, carregando } = useAutenticacao();

  if (carregando) {
    return null;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
