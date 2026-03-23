import { Card } from '../../../componentes';
import styles from './Dashboard.module.css';

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboard__header}>
        <h1>Dashboard</h1>
        <p>Bem-vindo ao sistema de locação de trajes a rigor</p>
      </header>

      <div className={styles.dashboard__cards}>
        <Card titulo="Clientes" className={styles['dashboard__card']}>
          <div className={styles['dashboard__card-content']}>
            <span className={styles['dashboard__numero']}>0</span>
            <span className={styles['dashboard__label']}>Total de clientes</span>
          </div>
        </Card>

        <Card titulo="Trajes" className={styles['dashboard__card']}>
          <div className={styles['dashboard__card-content']}>
            <span className={styles['dashboard__numero']}>0</span>
            <span className={styles['dashboard__label']}>Trajes disponíveis</span>
          </div>
        </Card>

        <Card titulo="Aluguéis" className={styles['dashboard__card']}>
          <div className={styles['dashboard__card-content']}>
            <span className={styles['dashboard__numero']}>0</span>
            <span className={styles['dashboard__label']}>Aluguéis ativos</span>
          </div>
        </Card>

        <Card titulo="Receita" className={styles['dashboard__card']}>
          <div className={styles['dashboard__card-content']}>
            <span className={styles['dashboard__numero']}>R$ 0,00</span>
            <span className={styles['dashboard__label']}>Receita do mês</span>
          </div>
        </Card>
      </div>

      <div className={styles.dashboard__info}>
        <Card titulo="Sobre o Sistema">
          <p>
            O <strong>TCC</strong> é um sistema de gestão de locação de trajes a rigor, desenvolvido
            como projeto de Trabalho de Conclusão de Curso (TCC) da FATEC.
          </p>
          <p>
            Este aplicativo permite gerenciar clientes, trajes e aluguéis de forma eficiente e
            organizada.
          </p>
        </Card>
      </div>
    </div>
  );
}
