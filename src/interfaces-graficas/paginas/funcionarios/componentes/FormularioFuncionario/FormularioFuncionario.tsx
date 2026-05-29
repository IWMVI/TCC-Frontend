import { useState } from 'react';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import {
  FuncionarioRequest,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';
import styles from '@/interfaces-graficas/paginas/funcionarios/componentes/FormularioFuncionario/FormularioFuncionario.module.css';

interface FormularioFuncionarioProps {
  valoresIniciais?: {
    nome: string;
    email: string;
  };
  modoEdicao?: boolean;
  estaEnviando: boolean;
  onSubmit: (dados: FuncionarioRequest | FuncionarioUpdateRequest) => void;
  onCancelar: () => void;
}

export function FormularioFuncionario({
  valoresIniciais,
  modoEdicao = false,
  estaEnviando,
  onSubmit,
  onCancelar,
}: Readonly<FormularioFuncionarioProps>) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? '');
  const [email, setEmail] = useState(valoresIniciais?.email ?? '');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroForm, setErroForm] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErroForm(null);

    if (!modoEdicao) {
      if (senha.length < 6) {
        setErroForm('Senha deve ter no mínimo 6 caracteres');
        return;
      }
      if (senha !== confirmarSenha) {
        setErroForm('As senhas não coincidem');
        return;
      }
      onSubmit({ nome: nome.trim(), email: email.trim(), senha });
      return;
    }

    const dados: FuncionarioUpdateRequest = {
      nome: nome.trim(),
      email: email.trim(),
    };
    if (senha.trim()) {
      if (senha.length < 6) {
        setErroForm('Senha deve ter no mínimo 6 caracteres');
        return;
      }
      dados.senha = senha;
    }
    onSubmit(dados);
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      {erroForm && <p className={styles.formulario__erro}>{erroForm}</p>}
      <CampoFormulario
        label="Nome"
        nome="nome"
        valor={nome}
        onChange={setNome}
        obrigatorio
      />
      <CampoFormulario
        label="E-mail"
        nome="email"
        tipo="email"
        valor={email}
        onChange={setEmail}
        obrigatorio
      />
      <CampoFormulario
        label={modoEdicao ? 'Nova senha (opcional)' : 'Senha'}
        nome="senha"
        tipo="password"
        valor={senha}
        onChange={setSenha}
        obrigatorio={!modoEdicao}
      />
      {!modoEdicao && (
        <CampoFormulario
          label="Confirmar senha"
          nome="confirmarSenha"
          tipo="password"
          valor={confirmarSenha}
          onChange={setConfirmarSenha}
          obrigatorio
        />
      )}
      <div className={styles.formulario__acoes}>
        <Botao tipo="secundario" tipoHtml="button" onClick={onCancelar} disabled={estaEnviando}>
          Cancelar
        </Botao>
        <Botao tipoHtml="submit" disabled={estaEnviando}>
          {estaEnviando ? 'Salvando...' : 'Salvar'}
        </Botao>
      </div>
    </form>
  );
}
