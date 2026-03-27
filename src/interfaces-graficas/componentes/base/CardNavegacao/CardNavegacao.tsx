import {useNavigate} from 'react-router-dom';
import {Botao} from '../Botao';
import styles from './CardNavegacao.module.css';

interface CardNavegacaoProps {
    icone: React.ReactNode;
    titulo: string;
    descricao: string;
    rota: string;
    textoBotao?: string;
}

export function CardNavegacao({icone, titulo, descricao, rota, textoBotao = 'Acessar'}: Readonly<CardNavegacaoProps>) {
    const navegar = useNavigate();

    return (
        <div className={styles['card-navegacao']}>
            <div className={styles['card-navegacao__icone']} aria-hidden="true">
                {icone}
            </div>
            <h2 className={styles['card-navegacao__titulo']}>{titulo}</h2>
            <p className={styles['card-navegacao__descricao']}>{descricao}</p>
            <Botao onClick={() => navegar(rota)}>{textoBotao}</Botao>
        </div>
    );
}
