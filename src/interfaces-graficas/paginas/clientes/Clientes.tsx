import {useNavigate} from 'react-router-dom';
import {UserPlus, Users} from 'lucide-react';
import {CardNavegacao} from '../../componentes/base/CardNavegacao';
import styles from './Clientes.module.css';

export function Clientes() {
    const navegar = useNavigate();

    return (
        <div className={styles.clientes}>
            <button className={styles.clientes__voltar} onClick={() => navegar('/dashboard')} type="button">
                ← Voltar
            </button>

            <section className={styles.clientes__cabecalho}>
                <h1 className={styles.clientes__titulo}>Controle de Clientes</h1>
                <p className={styles.clientes__subtitulo}>Escolha uma opção abaixo</p>
            </section>

            <section className={styles.clientes__cards} aria-label="Opções de clientes">
                <CardNavegacao
                    rota="/clientes/novo"
                    titulo="Adicionar Cliente"
                    descricao="Cadastre um novo cliente no sistema"
                    icone={<UserPlus size={36} strokeWidth={1.5} aria-hidden="true"/>}
                    textoBotao="Cadastrar"
                />
                <CardNavegacao
                    rota="/clientes/listar"
                    titulo="Listar Clientes"
                    descricao="Visualize e edite clientes cadastrados"
                    icone={<Users size={36} strokeWidth={1.5} aria-hidden="true"/>}
                    textoBotao="Visualizar"
                />
            </section>
        </div>
    );
}
