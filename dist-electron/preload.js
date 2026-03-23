import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  plataforma: process.platform,
  versaoApp: process.versions.electron,
  notificar: (mensagem, tipo = "info") => {
      ipcRenderer.send("notificacao", {mensagem, tipo});
  },
  abrirLinkExterno: (url) => {
      ipcRenderer.send("abrir-link-externo", url);
  },
  minimizarJanela: () => {
      ipcRenderer.send("minimizar-janela");
  },
  maximizarJanela: () => {
      ipcRenderer.send("maximizar-janela");
  },
  fecharJanela: () => {
      ipcRenderer.send("fechar-janela");
  }
});
