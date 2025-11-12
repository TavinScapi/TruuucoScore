if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
      .catch(err => console.log('❌ Erro ao registrar Service Worker:', err));
  });
}
let deferredPrompt;
const pwaBanner = document.getElementById("pwaBanner");
const installBtn = document.getElementById("installBtn");
const recusarBtn = document.querySelector(".muted");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  pwaBanner.style.display = "flex";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Usuário escolheu: ${outcome}`);

  deferredPrompt = null;
  pwaBanner.style.display = "none";
});

recusarBtn.addEventListener("click", () => {
  pwaBanner.style.display = "none";
  deferredPrompt = null;
  console.log("Usuário recusou instalar o app.");
});

window.addEventListener("appinstalled", () => {
  console.log("✅ PWA instalado!");
  pwaBanner.style.display = "none";
});