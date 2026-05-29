import { UserPlus, Users } from 'lucide-react';
import { CardNavegacao } from '@/interfaces-graficas/componentes/base/CardNavegacao';
import styles from '@/interfaces-graficas/paginas/clientes/Clientes.module.css';

export function Funcionarios() {
  return (
    <div className={styles.clientes}>
      <section className={styles.clientes__cabecalho}>
        <h1 className={styles.clientes__titulo}>Funcionários</h1>
        <p className={styles.clientes__subtitulo}>
          Cadastre colaboradores e envie confirmação por e-mail
        </p>
      </section>

      <section className={styles.clientes__cards} aria-label="Opções de funcionários">
        <CardNavegacao
          rota="/funcionarios/novo"
          titulo="Novo funcionário"
          descricao="Cadastrar e enviar link de confirmação"
          icone={<UserPlus size={36} strokeWidth={1.5} aria-hidden="true" />}
          textoBotao="Cadastrar"
        />
        <CardNavegacao
          rota="/funcionarios/listar"
          titulo="Listar funcionários"
          descricao="Visualize e edite funcionários"
          icone={<Users size={36} strokeWidth={1.5} aria-hidden="true" />}
          textoBotao="Visualizar"
        />
      </section>
    </div>
  );
}
