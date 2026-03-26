import { Link } from 'react-router-dom';
import { Card, Botao } from '../../componentes';
import styles from './Trajes.module.css';

export function Trajes() {
  return (
    <div className={styles['trajes-page']}>
      <header className={styles['trajes-page__header']}>
        <div>
          <h1>Trajes</h1>
          <p>Gerencie o catálogo de trajes do sistema.</p>
        </div>
        <Link to="/trajes/novo">
          <Botao>Novo Traje</Botao>
        </Link>
      </header>

      <Card titulo="Lista de Trajes">
        <p>Ainda não existem trajes cadastrados. Clique em "Novo Traje" para começar.</p>
      </Card>
    </div>
  );
}
