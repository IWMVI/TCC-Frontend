import {ClipboardList, Shirt, Users} from 'lucide-react';
import {CardNavegacao} from '../../../componentes/base/CardNavegacao';
import styles from './Dashboard.module.css';

const ITENS_NAVEGACAO = [
    {
        rota: '/clientes',
        titulo: 'Clientes',
        descricao: 'Visualizar e cadastrar clientes',
        icone: <Users size={40} strokeWidth={1.5} aria-hidden="true"/>,
    },
    {
        rota: '/trajes',
        titulo: 'Trajes',
        descricao: 'Controle o estoque de trajes',
        icone: <Shirt size={40} strokeWidth={1.5} aria-hidden="true"/>,
    },
    {
        rota: '/alugueis',
        titulo: 'Aluguéis',
        descricao: 'Gerencie os contratos e devoluções',
        icone: <ClipboardList size={40} strokeWidth={1.5} aria-hidden="true"/>,
    },
] as const;

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
        <section className={styles.dashboard__boas_vindas}>
            <h1 className={styles.dashboard__titulo}>Bem-vindo(a), Funcionário!</h1>
            <p className={styles.dashboard__subtitulo}>
                Gerencie os trajes, cadastros de clientes e aluguéis de forma prática.
            </p>
        </section>

        <section className={styles.dashboard__cards} aria-label="Módulos do sistema">
            {ITENS_NAVEGACAO.map((item) => (
                <CardNavegacao
                    key={item.rota}
                    rota={item.rota}
                    titulo={item.titulo}
                    descricao={item.descricao}
                    icone={item.icone}
                />
            ))}
        </section>
    </div>
  );
}
