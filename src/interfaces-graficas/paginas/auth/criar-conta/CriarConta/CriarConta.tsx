import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import { RegistrarFuncionarioUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import { FalhaRequisicao } from '@domain/erros';
import authStyles from '@/interfaces-graficas/estilos/AuthPagina.module.css';

const registrarUseCase = new RegistrarFuncionarioUseCase(new AuthApiRepository());

export function CriarConta() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setEnviando(true);
    try {
      await registrarUseCase.executar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });
      setSucesso(true);
    } catch (e) {
      setErro(
        e instanceof FalhaRequisicao
          ? e.message
          : 'Não foi possível criar a conta. Tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={authStyles.auth}>
      <header className={authStyles.auth__header}>
        <p className={authStyles.auth__header_titulo}>
          Painel Administrativo – Sistema Interno
        </p>
      </header>

      <main className={authStyles.auth__conteudo}>
        <div className={authStyles.auth__card}>
          <h1 className={authStyles.auth__titulo}>Criar conta</h1>
          <p className={authStyles.auth__subtitulo}>
            Cadastre-se para acessar o sistema da locadora
          </p>

          {erro && (
            <Alert variant="danger" dismissible onClose={() => setErro(null)}>
              {erro}
            </Alert>
          )}

          {sucesso ? (
            <>
              <Alert variant="success">
                Conta criada com sucesso! Enviamos um e-mail de confirmação. Ative
                sua conta antes de entrar.
              </Alert>
              <Link to="/login" className={authStyles.auth__link}>
                Ir para o login
              </Link>
            </>
          ) : (
            <form className={authStyles.auth__formulario} onSubmit={handleSubmit}>
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
                placeholder="seu@email.com"
              />
              <CampoFormulario
                label="Senha"
                nome="senha"
                tipo="password"
                valor={senha}
                onChange={setSenha}
                obrigatorio
                placeholder="••••••"
              />
              <CampoFormulario
                label="Confirmar senha"
                nome="confirmarSenha"
                tipo="password"
                valor={confirmarSenha}
                onChange={setConfirmarSenha}
                obrigatorio
                placeholder="••••••"
              />
              <Botao tipoHtml="submit" disabled={enviando}>
                {enviando ? 'Criando conta...' : 'Criar conta'}
              </Botao>
            </form>
          )}

          {!sucesso && (
            <div className={authStyles.auth__rodape}>
              <p className={authStyles.auth__texto}>Já tem conta?</p>
              <Link to="/login" className={authStyles.auth__link}>
                Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
