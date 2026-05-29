import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { ConfirmarEmailUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import { FalhaRequisicao } from '@domain/erros';
import authStyles from '@/interfaces-graficas/estilos/AuthPagina.module.css';

const confirmarUseCase = new ConfirmarEmailUseCase(new AuthApiRepository());

export function ConfirmarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [carregando, setCarregando] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErro('Link inválido. Token não informado.');
      setCarregando(false);
      return;
    }

    async function confirmar() {
      try {
        await confirmarUseCase.executar(token);
        setSucesso(true);
      } catch (e) {
        setErro(
          e instanceof FalhaRequisicao
            ? e.message
            : 'Não foi possível confirmar o e-mail.',
        );
      } finally {
        setCarregando(false);
      }
    }

    void confirmar();
  }, [token]);

  return (
    <div className={authStyles.auth}>
      <header className={authStyles.auth__header}>
        <p className={authStyles.auth__header_titulo}>
          Painel Administrativo – Sistema Interno
        </p>
      </header>

      <main className={authStyles.auth__conteudo}>
        <div className={authStyles.auth__card}>
          <h1 className={authStyles.auth__titulo}>Confirmação de e-mail</h1>
          <p className={authStyles.auth__subtitulo}>
            Ative sua conta para acessar o painel
          </p>

          {carregando && (
            <p className={authStyles.auth__texto}>Validando seu link...</p>
          )}

          {!carregando && sucesso && (
            <>
              <Alert variant="success">
                E-mail confirmado com sucesso! Você já pode entrar no sistema.
              </Alert>
              <Link to="/login" className={authStyles.auth__link}>
                Ir para o login
              </Link>
            </>
          )}

          {!carregando && erro && (
            <>
              <Alert variant="danger">{erro}</Alert>
              <Link to="/login" className={authStyles.auth__link}>
                Voltar ao login
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
