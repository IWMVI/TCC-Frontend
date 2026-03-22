"use strict";
const electron = require("electron");
const path = require("path");
const log = require("electron-log");
log.initialize();
log.info("Aplicação Celidone iniciada");
electron.app.commandLine.appendSwitch("disable-gpu-cache");
process.on("uncaughtException", (erro) => {
  log.error("Erro não tratado:", erro);
  electron.app.exit(1);
});
process.on("unhandledRejection", (motivo) => {
  log.error("Rejeição não tratada:", motivo);
});
let janelaPrincipal = null;
const JANELA_LARGURA = 1200;
const JANELA_ALTURA = 800;
function criarMenu() {
  const menu = electron.Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [
        { role: "quit", label: "Sair" }
      ]
    },
    {
      label: "Editar",
      submenu: [
        { role: "undo", label: "Desfazer" },
        { role: "redo", label: "Refazer" },
        { type: "separator" },
        { role: "cut", label: "Recortar" },
        { role: "copy", label: "Copiar" },
        { role: "paste", label: "Colar" },
        { role: "selectAll", label: "Selecionar Tudo" }
      ]
    },
    {
      label: "Visualizar",
      submenu: [
        { role: "reload", label: "Recarregar" },
        { role: "forceReload", label: "Forçar Recarregamento" },
        { role: "toggleDevTools", label: "Ferramentas do Desenvolvedor" },
        { type: "separator" },
        { role: "resetZoom", label: "Zoom Padrão" },
        { role: "zoomIn", label: "Aumentar Zoom" },
        { role: "zoomOut", label: "Diminuir Zoom" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tela Cheia" }
      ]
    },
    {
      label: "Janela",
      submenu: [
        { role: "minimize", label: "Minimizar" },
        { role: "close", label: "Fechar" }
      ]
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre o Celidone",
          click: () => {
            electron.shell.openExternal("https://github.com/anomalyco/celidone");
          }
        }
      ]
    }
  ]);
  electron.Menu.setApplicationMenu(menu);
}
function criarJanela() {
  log.info("Criando janela principal");
  janelaPrincipal = new electron.BrowserWindow({
    width: JANELA_LARGURA,
    height: JANELA_ALTURA,
    minWidth: 800,
    minHeight: 600,
    title: "Celidone - Sistema de Locação de Trajes",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    show: false
  });
  janelaPrincipal.once("ready-to-show", () => {
    log.info("Janela pronta para exibir");
    janelaPrincipal == null ? void 0 : janelaPrincipal.show();
  });
  janelaPrincipal.on("closed", () => {
    janelaPrincipal = null;
  });
  const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
  if (isDev) {
    const urlDev = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    log.info(`Carregando URL de desenvolvimento: ${urlDev}`);
    janelaPrincipal.loadURL(urlDev);
    janelaPrincipal.webContents.openDevTools();
  } else {
    const caminhoProducao = path.join(__dirname, "../dist/index.html");
    log.info(`Carregando arquivo de produção: ${caminhoProducao}`);
    janelaPrincipal.loadFile(caminhoProducao);
  }
  janelaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(() => {
  log.info("App está pronto");
  criarMenu();
  criarJanela();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});
electron.app.on("window-all-closed", () => {
  log.info("Todas as janelas foram fechadas");
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  log.info("Aplicação encerrando");
});
