import { Link } from 'react-router-dom';
import { Card, Botao } from '../../componentes';
import styles from './Alugueis.module.css';

export function Alugueis() {
  return (
    <div className={styles['alugueis-page']}>
      <header className={styles['alugueis-page__header']}>
        <div>
          <h1>Aluguéis</h1>
          <p>Gerencie os contratos e movimentações de aluguel.</p>
        </div>
        <Link to="/alugueis/novo">
          <Botao>Novo Aluguel</Botao>
        </Link>
      </header>

      <Card titulo="Lista de Aluguéis">
        <p>Ainda não existem aluguéis cadastrados. Clique em "Novo Aluguel" para iniciar.</p>
      </Card>
    </div>
  );
}
