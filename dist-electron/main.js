import { app, BrowserWindow, Menu, shell } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import log from "electron-log";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
log.initialize();
log.info("Aplicação TCC iniciada");
app.commandLine.appendSwitch("disable-gpu-cache");
process.on("uncaughtException", (erro) => {
  log.error("Erro não tratado:", erro);
  app.exit(1);
});
process.on("unhandledRejection", (motivo) => {
  log.error("Rejeição não tratada:", motivo);
});
let janelaPrincipal = null;
const JANELA_LARGURA = 1200;
const JANELA_ALTURA = 800;
function criarMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [{ role: "quit", label: "Sair" }]
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
          label: "Sobre o TCC",
          click: () => {
            shell.openExternal("https://github.com/anomalyco/tcc");
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}
function criarJanela() {
  log.info("Criando janela principal");
  janelaPrincipal = new BrowserWindow({
    width: JANELA_LARGURA,
    height: JANELA_ALTURA,
    minWidth: 800,
    minHeight: 600,
    title: "TCC - Sistema de Locação de Trajes",
    webPreferences: {
      preload: join(__dirname$1, "preload.js"),
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
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    const urlDev = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    log.info(`Carregando URL de desenvolvimento: ${urlDev}`);
    janelaPrincipal.loadURL(urlDev);
  } else {
    const caminhoProducao = join(__dirname$1, "../dist/index.html");
    log.info(`Carregando arquivo de produção: ${caminhoProducao}`);
    janelaPrincipal.loadFile(caminhoProducao);
  }
  janelaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}
app.whenReady().then(() => {
  log.info("App está pronto");
  criarMenu();
  criarJanela();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});
app.on("window-all-closed", () => {
  log.info("Todas as janelas foram fechadas");
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("before-quit", () => {
  log.info("Aplicação encerrando");
});
