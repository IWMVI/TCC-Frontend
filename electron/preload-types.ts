export interface ElectronAPI {
  plataforma: string;
  versaoApp: string;
  notificar: (mensagem: string, tipo?: 'sucesso' | 'erro' | 'info') => void;
  abrirLinkExterno: (url: string) => void;
  minimizarJanela: () => void;
  maximizarJanela: () => void;
  fecharJanela: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
