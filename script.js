(function () {
  const overlay = document.getElementById('editModal');
  const editButtons = document.querySelectorAll('.edit-team');
  const teamNameInput = document.getElementById('teamNameInput');
  const modalTitle = document.getElementById('modalTitle');
  const suitOptions = document.getElementById('suitOptions');
  const form = document.getElementById('teamNameForm');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelEdit');
  const startBtn = document.getElementById('start-game');
  let currentTeam = null;

  // Esconde spans de naipe vazios ao carregar
  document.querySelectorAll('.team-cards .item-icon-bg').forEach(bg => {
    const suitSpan = bg.querySelector('.team-suit');
    if (suitSpan && !suitSpan.textContent.trim()) {
      suitSpan.style.display = 'none';
    }
  });

  function mapSuitToClass(suit) {
    if (suit === '♠') return 'spade';
    if (suit === '♥') return 'heart';
    if (suit === '♦') return 'diamond';
    if (suit === '♣') return 'club';
    if (suit === '🃏') return 'joker';
    return 'diamond';
  }

  function persistTeams() {
    const nosName = document.getElementById('team-name-nos').textContent.trim() || 'Nós';
    const elesName = document.getElementById('team-name-eles').textContent.trim() || 'Eles';
    const nosSuit = document.getElementById('team-suit-nos').textContent.trim() || '♦';
    const elesSuit = document.getElementById('team-suit-eles').textContent.trim() || '♦';

    const teams = {
      nos: { name: nosName, suit: nosSuit, suitClass: mapSuitToClass(nosSuit) },
      eles: { name: elesName, suit: elesSuit, suitClass: mapSuitToClass(elesSuit) }
    };
    localStorage.setItem('trucoTeams', JSON.stringify(teams));
  }

  function openModalFor(team) {
    currentTeam = team;
    const nameSpan = document.getElementById(`team-name-${team}`);
    const suitSpan = document.getElementById(`team-suit-${team}`);
    const currentName = nameSpan ? nameSpan.textContent.trim() : '';
    const currentSuit = suitSpan ? suitSpan.textContent.trim() : '';

    teamNameInput.value = currentName;
    modalTitle.textContent = `Editar Nome da Equipe — ${currentName || 'Equipe'}`;

    suitOptions.querySelectorAll('.suit-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.suit === currentSuit);
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    currentTeam = null;
  }

  function updateIcon(team, newSuit) {
    const nameSpan = document.getElementById(`team-name-${team}`);
    if (!nameSpan) return;
    const iconBg = nameSpan.closest('.team-name').querySelector('.item-icon-bg');
    const flagIcon = iconBg.querySelector('i');
    const suitSpan = iconBg.querySelector('.team-suit');

    if (newSuit) {
      if (suitSpan) {
        suitSpan.textContent = newSuit;
        suitSpan.style.display = 'inline';
      }
      if (flagIcon) flagIcon.style.display = 'none';
    } else {
      if (suitSpan) {
        suitSpan.textContent = '';
        suitSpan.style.display = 'none';
      }
      if (flagIcon) flagIcon.style.display = '';
    }
  }

  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const team = btn.dataset.team;
      if (team) openModalFor(team);
    });
  });

  suitOptions.addEventListener('click', (e) => {
    const opt = e.target.closest('.suit-option');
    if (!opt) return;
    suitOptions.querySelectorAll('.suit-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentTeam) return closeModal();

    const newName = teamNameInput.value.trim() || 'Equipe';
    const selected = suitOptions.querySelector('.suit-option.selected');
    const newSuit = selected ? selected.dataset.suit : '';

    const nameSpan = document.getElementById(`team-name-${currentTeam}`);
    const suitSpan = document.getElementById(`team-suit-${currentTeam}`);

    if (nameSpan) nameSpan.textContent = newName;
    if (suitSpan) suitSpan.textContent = newSuit;

    // substitui/oculta ícone de bandeira pelo naipe escolhido
    updateIcon(currentTeam, newSuit);

    // persiste imediatamente ao salvar no modal
    persistTeams();

    closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Fecha clicando no overlay (fora do modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape para fechar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Ao clicar em Iniciar, persiste e navega para marcador.html
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      persistTeams();
      // garante que o novo estado foi gravado antes da navegação
      setTimeout(() => {
        window.location.href = 'marcador/marcador.html';
      }, 50);
    });
  }
})();

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