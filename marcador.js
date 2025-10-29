document.addEventListener('DOMContentLoaded', function () {
    // Elementos
    const score1Els = document.querySelectorAll('.score1');
    const score2Els = document.querySelectorAll('.score2');
    const victories1 = document.getElementById('victories1');
    const victories2 = document.getElementById('victories2');
    const victoryModal = document.getElementById('victoryModal');
    const victoryTeamName = document.getElementById('victoryTeamName');
    const closeVictory = document.getElementById('closeVictory');
    const resetPointsBtn = document.getElementById('resetPoints');
    const resetVictoriesBtn = document.getElementById('resetVictories');
    const mainTrucoBtn = document.getElementById('mainTrucoBtn');
    const runBtn = document.getElementById('runBtn');
    const resetTrucoBtn = document.getElementById('resetTrucoBtn');
    const trucoStatus1 = document.getElementById('trucoStatus1');
    const trucoStatus2 = document.getElementById('trucoStatus2');
    const editIcons = document.querySelectorAll('.edit-icon');

    // Estado
    let scores = { team1: 0, team2: 0 };
    let victories = { team1: 0, team2: 0 };
    let naipeIndex = { team1: 0, team2: 0 };
    const naipes = ['diamond', 'spade', 'heart', 'club'];
    let trucoAtivo = false;
    let trucoIndex = 0;
    const trucoValues = [3, 6, 9, 12];
    let valorMarcador = 1;
    let valorMarcadorAnterior = 1; // Novo: guarda o valor anterior do marcador

    function atualizarMarcadores() {
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.textContent = `+${valorMarcador}`;
        });
        // Mostrar botão "Voltar ao 1" se truco estiver em 12
        if (trucoAtivo && valorMarcador === 12) {
            resetTrucoBtn.style.display = 'inline-block';
            mainTrucoBtn.style.display = 'none'; // esconde botão Truco
        } else {
            resetTrucoBtn.style.display = 'none';
            mainTrucoBtn.style.display = 'inline-block'; // mostra botão Truco normalmente
        }
    }

    function atualizarPlacar() {
        score1Els.forEach(el => el.textContent = scores.team1);
        score2Els.forEach(el => el.textContent = scores.team2);
        // Desabilita Truco se algum time chegar a 11
        if (scores.team1 >= 11 || scores.team2 >= 11) {
            mainTrucoBtn.disabled = true;
        } else {
            mainTrucoBtn.disabled = false;
        }
    }

    function atualizarVitorias() {
        victories1.querySelectorAll('.victory-card').forEach((el, i) => {
            el.classList.toggle('active', i < victories.team1);
        });
        victories2.querySelectorAll('.victory-card').forEach((el, i) => {
            el.classList.toggle('active', i < victories.team2);
        });
    }

    function resetarRodada() {
        scores.team1 = 0;
        scores.team2 = 0;
        atualizarPlacar();
        trucoAtivo = false;
        valorMarcador = 1;
        atualizarMarcadores();
        mainTrucoBtn.textContent = 'Truco';
        runBtn.style.display = 'none';
        trucoStatus1.textContent = '';
        trucoStatus2.textContent = '';
    }

    function isVictoryModalOpen() {
        return victoryModal.classList.contains('active');
    }

    function flipCard(team) {
        const card = document.querySelector(`#${team} .card`);
        card.classList.add('flip');
        setTimeout(() => {
            card.classList.remove('flip');
        }, 500); // tempo igual ao transition do CSS
    }

    // Pontuação
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (isVictoryModalOpen()) return;
            const team = this.closest('.team').id === 'team1' ? 'team1' : 'team2';
            flipCard(team);

            setTimeout(() => {
                scores[team] += valorMarcador;
                if (scores[team] >= 12) {
                    scores[team] = 12;
                    mostrarVitoria(team);
                }
                atualizarPlacar();

                // Se foi uma rodada de truco, resetar os botões
                if (trucoAtivo) {
                    trucoAtivo = false;
                    trucoIndex = 0;
                    valorMarcador = 1;
                    atualizarMarcadores();
                    mainTrucoBtn.textContent = 'Truco';
                    runBtn.style.display = 'none';
                    trucoStatus1.textContent = '';
                    trucoStatus2.textContent = '';
                }
            }, 500);
        });
    });

    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (isVictoryModalOpen()) return;
            const team = this.closest('.team').id === 'team1' ? 'team1' : 'team2';
            flipCard(team); // flip ao remover ponto
            setTimeout(() => {
                scores[team] = Math.max(0, scores[team] - 1);
                atualizarPlacar();
            }, 500);
        });
    });

    // Truco
    mainTrucoBtn.addEventListener('click', function () {
        if (!trucoAtivo) {
            trucoAtivo = true;
            trucoIndex = 0;
            valorMarcadorAnterior = valorMarcador; // Salva valor anterior
            valorMarcador = trucoValues[trucoIndex];
            atualizarMarcadores();
            mainTrucoBtn.textContent = trucoValues[trucoIndex + 1] || 'Truco';
            runBtn.style.display = 'inline-block';
            trucoStatus1.textContent = 'Rodada de Truco!';
            trucoStatus2.textContent = 'Rodada de Truco!';
        } else if (trucoIndex < trucoValues.length - 1) {
            trucoIndex++;
            valorMarcadorAnterior = valorMarcador; // Salva valor anterior
            valorMarcador = trucoValues[trucoIndex];
            mainTrucoBtn.textContent = trucoValues[trucoIndex + 1] || trucoValues[trucoIndex];
            atualizarMarcadores();
        }
    });

    resetTrucoBtn.addEventListener('click', function () {
        trucoAtivo = false;
        trucoIndex = 0;
        valorMarcador = 1;
        atualizarMarcadores();
        mainTrucoBtn.textContent = 'Truco';
        runBtn.style.display = 'none';
        trucoStatus1.textContent = '';
        trucoStatus2.textContent = '';
    });

    runBtn.addEventListener('click', function () {
        // O time que corre perde só a rodada, não zera os pontos
        trucoAtivo = false;
        trucoIndex = 0;
        // Ao correr, o adversário deve ganhar o valor anterior do marcador
        valorMarcador = valorMarcadorAnterior;
        atualizarMarcadores();
        mainTrucoBtn.textContent = 'Truco';
        runBtn.style.display = 'none';
        trucoStatus1.textContent = '';
        trucoStatus2.textContent = '';
    });

    // Vitória
    function mostrarVitoria(team) {
        setTimeout(() => {
            resetarRodada();
        }, 500);

        const teamName = document.querySelector(`#${team} .team-name`).value;
        victoryTeamName.textContent = teamName;
        victoryModal.classList.add('active');
        victories[team]++;
        atualizarVitorias();

        // Troca naipe da carta
        const card = document.querySelector(`#${team} .card`);
        card.classList.remove(...naipes);
        naipeIndex[team] = (naipeIndex[team] + 1) % naipes.length;
        card.classList.add(naipes[naipeIndex[team]]);
    }

    closeVictory.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        resetarRodada();
    });
    victoryModal.addEventListener('click', e => {
        if (e.target === victoryModal) {
            victoryModal.classList.remove('active');
            resetarRodada();
        }
    });

    // Reset
    resetPointsBtn.addEventListener('click', resetarRodada);

    resetVictoriesBtn.addEventListener('click', function () {
        victories.team1 = 0;
        victories.team2 = 0;
        atualizarVitorias();
        naipeIndex.team1 = 0;
        naipeIndex.team2 = 0;
        document.querySelector('#team1 .card').classList.remove('spade', 'heart', 'club');
        document.querySelector('#team1 .card').classList.add('diamond');
        document.querySelector('#team2 .card').classList.remove('spade', 'heart', 'club');
        document.querySelector('#team2 .card').classList.add('diamond');
    });

    // Editar nome do time
    editIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            input.focus();
            input.select();
        });
    });

    // Inicialização
    atualizarMarcadores();
    atualizarPlacar();
    atualizarVitorias();

    let wakeLock = null;

    async function ativarWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("🔒 Wake Lock ativado: tela não vai apagar!");
        } catch (err) {
            console.error("❌ Erro ao ativar Wake Lock:", err);
        }
    }

    function liberarWakeLock() {
        if (wakeLock) {
            wakeLock.release();
            wakeLock = null;
            console.log("🔓 Wake Lock liberado: tela pode apagar.");
        }
    }

    document.addEventListener("click", async function inicializarWakeLock() {
        await ativarWakeLock();
        // Remove o listener depois de ativar
        document.removeEventListener("click", inicializarWakeLock);
    });

    // Se o usuário mudar de aba/janela, precisamos reativar
    document.addEventListener("visibilitychange", () => {
        if (wakeLock !== null && document.visibilityState === "visible") {
            ativarWakeLock();
        }
    });

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("portrait").catch(err => {
            console.warn("Não foi possível travar orientação:", err);
        });
    }
});