import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import { RedefinirSenhaUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import { FalhaRequisicao } from '@domain/erros';
import authStyles from '@/interfaces-graficas/estilos/AuthPagina.module.css';

const redefinirUseCase = new RedefinirSenhaUseCase(new AuthApiRepository());

export function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!token) {
      setErro('Link inválido. Token não informado.');
      return;
    }
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
      await redefinirUseCase.executar({ token, senha });
      setSucesso(true);
    } catch (e) {
      setErro(
        e instanceof FalhaRequisicao
          ? e.message
          : 'Não foi possível redefinir a senha. Tente novamente.',
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
          <h1 className={authStyles.auth__titulo}>Nova senha</h1>
          <p className={authStyles.auth__subtitulo}>
            Defina uma nova senha para sua conta
          </p>

          {erro && (
            <Alert variant="danger" dismissible onClose={() => setErro(null)}>
              {erro}
            </Alert>
          )}

          {sucesso ? (
            <>
              <Alert variant="success">
                Senha alterada com sucesso! Você já pode entrar no sistema.
              </Alert>
              <Link to="/login" className={authStyles.auth__link}>
                Ir para o login
              </Link>
            </>
          ) : !token ? (
            <>
              <Alert variant="danger">Link inválido. Token não informado.</Alert>
              <Link to="/recuperar-senha" className={authStyles.auth__link}>
                Solicitar novo link
              </Link>
            </>
          ) : (
            <>
              <form className={authStyles.auth__formulario} onSubmit={handleSubmit}>
                <CampoFormulario
                  label="Nova senha"
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
                  {enviando ? 'Salvando...' : 'Redefinir senha'}
                </Botao>
              </form>

              <div className={authStyles.auth__rodape}>
                <Link to="/login" className={authStyles.auth__link}>
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
