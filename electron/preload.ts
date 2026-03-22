import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  plataforma: process.platform,
  versaoApp: process.versions.electron,
  notificar: (mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'info') => {
    ipcRenderer.send('notificacao', { mensagem, tipo });
  },
  abrirLinkExterno: (url: string) => {
    ipcRenderer.send('abrir-link-externo', url);
  },
  minimizarJanela: () => {
    ipcRenderer.send('minimizar-janela');
  },
  maximizarJanela: () => {
    ipcRenderer.send('maximizar-janela');
  },
  fecharJanela: () => {
    ipcRenderer.send('fechar-janela');
  },
});
