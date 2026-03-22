import { Card } from '../../componentes';
import './Dashboard.css';

export function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Dashboard</h1>
        <p>Bem-vindo ao sistema de locação de trajes a rigor</p>
      </header>

      <div className="dashboard__cards">
        <Card titulo="Clientes" className="dashboard__card">
          <div className="dashboard__card-content">
            <span className="dashboard__numero">0</span>
            <span className="dashboard__label">Total de clientes</span>
          </div>
        </Card>

        <Card titulo="Trajes" className="dashboard__card">
          <div className="dashboard__card-content">
            <span className="dashboard__numero">0</span>
            <span className="dashboard__label">Trajes disponíveis</span>
          </div>
        </Card>

        <Card titulo="Aluguéis" className="dashboard__card">
          <div className="dashboard__card-content">
            <span className="dashboard__numero">0</span>
            <span className="dashboard__label">Aluguéis ativos</span>
          </div>
        </Card>

        <Card titulo="Receita" className="dashboard__card">
          <div className="dashboard__card-content">
            <span className="dashboard__numero">R$ 0,00</span>
            <span className="dashboard__label">Receita do mês</span>
          </div>
        </Card>
      </div>

      <div className="dashboard__info">
        <Card titulo="Sobre o Sistema">
          <p>
            O <strong>TCC</strong> é um sistema de gestão de locação de trajes a rigor,
            desenvolvido como projeto de Trabalho de Conclusão de Curso (TCC) da FATEC.
          </p>
          <p>
            Este aplicativo permite gerenciar clientes, trajes e aluguéis de forma eficiente
            e organizada.
          </p>
        </Card>
      </div>
    </div>
  );
}
