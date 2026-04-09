import { useNavigate } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { CardNavegacao } from '../../componentes/base/CardNavegacao';
import { TRAJE_CONSTANTS } from '@application/trajes';
import styles from './Trajes.module.css';

export function Trajes() {
    const navegar = useNavigate();

    return (
        <div className={styles.trajes}>
            <button className={styles.trajes__voltar} onClick={() => navegar('/dashboard')} type="button">
                ← Voltar
            </button>

            <section className={styles.trajes__cabecalho}>
                <h1 className={styles.trajes__titulo}>Controle de Trajes</h1>
                <p className={styles.trajes__subtitulo}>Escolha uma opção abaixo</p>
            </section>

            <section className={styles.trajes__cards} aria-label="Opções de trajes">
                <CardNavegacao
                    rota={TRAJE_CONSTANTS.ROUTES.CRIAR}
                    titulo="Adicionar Traje"
                    descricao="Cadastre um novo traje no sistema"
                    icone={<UserPlus size={36} strokeWidth={1.5} aria-hidden="true" />}
                    textoBotao="Cadastrar"
                />
                <CardNavegacao
                    rota={TRAJE_CONSTANTS.ROUTES.LISTAR}
                    titulo="Listar Trajes"
                    descricao="Visualize e edite trajes cadastrados"
                    icone={<Users size={36} strokeWidth={1.5} aria-hidden="true" />}
                    textoBotao="Visualizar"
                />
            </section>
        </div>
    );
}