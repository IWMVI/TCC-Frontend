"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  plataforma: process.platform,
  versaoApp: process.versions.electron,
  notificar: (mensagem, tipo = "info") => {
    electron.ipcRenderer.send("notificacao", { mensagem, tipo });
  },
  abrirLinkExterno: (url) => {
    electron.ipcRenderer.send("abrir-link-externo", url);
  },
  minimizarJanela: () => {
    electron.ipcRenderer.send("minimizar-janela");
  },
  maximizarJanela: () => {
    electron.ipcRenderer.send("maximizar-janela");
  },
  fecharJanela: () => {
    electron.ipcRenderer.send("fechar-janela");
  }
});
