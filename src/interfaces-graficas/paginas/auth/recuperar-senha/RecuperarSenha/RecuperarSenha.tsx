import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import { SolicitarRecuperacaoSenhaUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import { FalhaRequisicao } from '@domain/erros';
import authStyles from '@/interfaces-graficas/estilos/AuthPagina.module.css';

const recuperarUseCase = new SolicitarRecuperacaoSenhaUseCase(new AuthApiRepository());

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await recuperarUseCase.executar(email.trim().toLowerCase());
      setEnviado(true);
    } catch (e) {
      setErro(
        e instanceof FalhaRequisicao
          ? e.message
          : 'Não foi possível enviar o e-mail. Tente novamente.',
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
          <h1 className={authStyles.auth__titulo}>Recuperar senha</h1>
          <p className={authStyles.auth__subtitulo}>
            Informe seu e-mail para receber o link de redefinição
          </p>

          {erro && (
            <Alert variant="danger" dismissible onClose={() => setErro(null)}>
              {erro}
            </Alert>
          )}

          {enviado ? (
            <>
              <Alert variant="success">
                Se o e-mail estiver cadastrado, você receberá um link para definir
                uma nova senha. Verifique sua caixa de entrada.
              </Alert>
              <Link to="/login" className={authStyles.auth__link}>
                Voltar ao login
              </Link>
            </>
          ) : (
            <>
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
                <Botao tipoHtml="submit" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar link'}
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
