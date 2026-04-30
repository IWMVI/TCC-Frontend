import {useNavigate} from 'react-router-dom';
import {UserPlus, Users} from 'lucide-react';
import {CardNavegacao} from '../../componentes/base/CardNavegacao';
import styles from './Alugueis.module.css';

export function Alugueis() {
    const navegar = useNavigate();

    return (
        <div className={styles.alugueis}>
            <button className={styles.alugueis__voltar} onClick={() => navegar('/dashboard')} type="button">
                ← Voltar
            </button>

            <section className={styles.alugueis__cabecalho}>
                <h1 className={styles.alugueis__titulo}>Controle de Aluguéis</h1>
                <p className={styles.alugueis__subtitulo}>Escolha uma opção abaixo</p>
            </section>

            <section className={styles.alugueis__cards} aria-label="Opções de aluguéis">
                <CardNavegacao
                    rota="/alugueis/novo"
                    titulo="Adicionar Aluguel"
                    descricao="Cadastre um novo aluguel no sistema"
                    icone={<UserPlus size={36} strokeWidth={1.5} aria-hidden="true"/>}
                    textoBotao="Cadastrar"
                />
                <CardNavegacao
                    rota="/alugueis/listar"
                    titulo="Listar Aluguéis"
                    descricao="Visualize e edite aluguéis cadastrados"
                    icone={<Users size={36} strokeWidth={1.5} aria-hidden="true"/>}
                    textoBotao="Visualizar"
                />
            </section>
        </div>
    );
}