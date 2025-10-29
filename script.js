// Inicializa os ícones do Lucide
lucide.createIcons();

// Animação do botão "Iniciar partida"
const startBtn = document.querySelector(".start-btn");
startBtn.addEventListener("click", () => {
  startBtn.classList.add("clicked");
  setTimeout(() => {
    alert("Partida iniciada!");
    startBtn.classList.remove("clicked");
  }, 500);
});
