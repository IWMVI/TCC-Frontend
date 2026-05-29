import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import { useAutenticacao } from '@/interfaces-graficas/contextos/ContextoAutenticacao';
import { ReenviarConfirmacaoUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import { FalhaRequisicao } from '@domain/erros';
import authStyles from '@/interfaces-graficas/estilos/AuthPagina.module.css';

const reenviarUseCase = new ReenviarConfirmacaoUseCase(new AuthApiRepository());

export function Login() {
  const navigate = useNavigate();
  const { login, autenticado, carregando } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  if (!carregando && autenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setEmailNaoVerificado(false);
    setMensagemSucesso(null);
    setEnviando(true);

    try {
      await login({ email: email.trim().toLowerCase(), senha });
      navigate('/dashboard', { replace: true });
    } catch (e) {
      const mensagem =
        e instanceof FalhaRequisicao ? e.message : 'Não foi possível entrar. Tente novamente.';
      setErro(mensagem);
      if (mensagem.toLowerCase().includes('não verificado')) {
        setEmailNaoVerificado(true);
      }
    } finally {
      setEnviando(false);
    }
  }

  async function handleReenviarConfirmacao() {
    setReenviando(true);
    setMensagemSucesso(null);
    try {
      await reenviarUseCase.executar(email.trim().toLowerCase());
      setMensagemSucesso('E-mail de confirmação reenviado. Verifique sua caixa de entrada.');
    } catch (e) {
      setErro(
        e instanceof FalhaRequisicao
          ? e.message
          : 'Não foi possível reenviar o e-mail.',
      );
    } finally {
      setReenviando(false);
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
          <h1 className={authStyles.auth__titulo}>Entrar no sistema</h1>
          <p className={authStyles.auth__subtitulo}>
            Locadora de Trajes a Rigor
          </p>

          {erro && (
            <Alert variant="danger" dismissible onClose={() => setErro(null)}>
              {erro}
            </Alert>
          )}

          {mensagemSucesso && <Alert variant="success">{mensagemSucesso}</Alert>}

          <form className={authStyles.auth__formulario} onSubmit={handleSubmit}>
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
            <div className={authStyles.auth__links}>
              <Link to="/recuperar-senha" className={authStyles.auth__link}>
                Esqueci minha senha
              </Link>
            </div>
            <Botao tipoHtml="submit" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </Botao>
          </form>

          {emailNaoVerificado && (
            <div className={authStyles.auth__reenviar}>
              <p>Confirme seu e-mail antes de acessar o sistema.</p>
              <Botao
                tipo="secundario"
                tipoHtml="button"
                onClick={handleReenviarConfirmacao}
                disabled={reenviando || !email.trim()}
              >
                {reenviando ? 'Enviando...' : 'Reenviar confirmação'}
              </Botao>
            </div>
          )}

          <div className={authStyles.auth__rodape}>
            <p className={authStyles.auth__texto}>Não tem conta?</p>
            <Link to="/criar-conta" className={authStyles.auth__link}>
              Criar conta
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
