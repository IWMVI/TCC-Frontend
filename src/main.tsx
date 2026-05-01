import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './interfaces-graficas/estilos/global.css';
import { ProvedorTema } from './interfaces-graficas/contextos/ContextoTema';

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProvedorTema>
      <BrowserRouter {...router}>
        <App />
      </BrowserRouter>
    </ProvedorTema>
  </React.StrictMode>
);
