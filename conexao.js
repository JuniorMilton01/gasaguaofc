// Verifica se está online ou offline
function verificarConexao() {
  const statusOnline = navigator.onLine;
  
  if (statusOnline) {
    console.log("🟢 ONLINE - Sincronizando...");
    document.body.classList.remove('offline-mode');
    document.body.style.filter = "none";
    sincronizarDados();
  } else {
    console.log("🔴 OFFLINE - Modo local ativado");
    document.body.classList.add('offline-mode');
    document.body.style.filter = "grayscale(80%)";
    
    // Mostra alerta apenas uma vez por sessão
    if (!window.offlineAlertShown) {
      alert("Você está offline. Os dados serão salvos localmente e sincronizados quando voltar a internet.");
      window.offlineAlertShown = true;
    }
  }
}

// Tenta sincronizar com servidor (quando houver backend)
function sincronizarDados() {
  // Verifica a cada 10 segundos se está online
  setInterval(function() {
    if (navigator.onLine) {
      console.log("Verificando atualizações...");
      // TODO: Implementar sincronização real quando tiver backend
      // fetch('/api/sync').then(...).catch(...)
    }
  }, 10000);
}

// Escuta mudanças de conexão
window.addEventListener('online', function() {
  console.log("Conexão restaurada!");
  verificarConexao();
});

window.addEventListener('offline', function() {
  console.log("Conexão perdida!");
  verificarConexao();
});

// Verifica ao carregar a página
document.addEventListener('DOMContentLoaded', verificarConexao);