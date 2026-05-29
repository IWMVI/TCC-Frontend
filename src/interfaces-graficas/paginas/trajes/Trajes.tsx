import { UserPlus, Users } from 'lucide-react';
import { CardNavegacao } from '@/interfaces-graficas/componentes/base/CardNavegacao';
import { TRAJE_CONSTANTS } from '@application/trajes';
import styles from '@/interfaces-graficas/paginas/trajes/Trajes.module.css';

export function Trajes() {
  return (
    <div className={styles.trajes}>
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
