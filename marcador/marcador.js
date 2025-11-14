document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento: team1 corresponde ao time "nos", team2 a "eles"
    const mapping = { team1: 'nos', team2: 'eles' };
    Object.keys(mapping).forEach(teamId => {
        const teamEl = document.getElementById(teamId);
        if (!teamEl) return;
        const key = 'teamSkin_' + mapping[teamId];
        const raw = localStorage.getItem(key);
        if (!raw) return;
        try {
            const skin = JSON.parse(raw);
            // procura os elementos .front e .back dentro da carta do time
            const card = teamEl.querySelector('.card');
            if (!card) return;
            const front = card.querySelector('.front');
            const back = card.querySelector('.back');
            if (front && skin.front) {
                front.style.backgroundImage = `url("${skin.front}")`;
                // garante sizing parecido com o atual
                front.style.backgroundSize = '120% 120%';
                front.style.backgroundPosition = 'center';
            }
            if (back && skin.back) {
                back.style.backgroundImage = `url("${skin.back}")`;
                back.style.backgroundSize = '120% 121%';
                back.style.backgroundPosition = 'center';
            }
        } catch (err) {
            console.warn('erro ao aplicar skin:', err);
        }
    });
});

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
    // cada time terá um naipe atual (símbolo) e classe (diamond, spade, heart, club, joker)
    let teamData = {
        team1: { name: 'Time 1', suit: '♦', suitClass: 'diamond' },
        team2: { name: 'Time 2', suit: '♦', suitClass: 'diamond' }
    };
    const naipes = ['diamond', 'spade', 'heart']; // melhor de 3 — 3 símbolos
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

        // Atualiza nome do time a partir do input (se existir) ou do localStorage
        const inputEl = document.querySelector(`#${team} .team-name`);
        const teamName = inputEl ? inputEl.value : teamData[team].name;

        // Incrementa vitórias (melhor de 3)
        victories[team]++;
        atualizarVitorias();

    // Define o naipe vencedor a partir do naipe atual do time (mantido internamente)
    // Mas não exibimos o símbolo junto ao nome do time — mostramos apenas o nome.
    // O naipe ainda é usado para atualização visual da carta.
    // const winnerSuit = teamData[team].suit || (team === 'team1' ? '♦' : '♦');
    victoryTeamName.textContent = teamName;
        victoryModal.classList.add('active');

        // Atualiza a carta visual do time para o próximo naipe (rotação simples)
        const card = document.querySelector(`#${team} .card`);
        if (card) {
            // remove classes conhecidas
            card.classList.remove('diamond', 'spade', 'heart');
            // pega a classe atual e avança (se quiser manter rotação visual)
            const currentClass = teamData[team].suitClass || 'diamond';
            const idx = naipes.indexOf(currentClass);
            const nextClass = naipes[(idx + 1) % naipes.length];
            card.classList.add(nextClass);
            // atualiza dado do time
            teamData[team].suitClass = nextClass;
            // mapa de classe para símbolo
            const classToSymbol = { diamond: '♦', spade: '♠', heart: '♥' };
            teamData[team].suit = classToSymbol[nextClass] || '♦';
        }

        // Persistir vitórias e naipe no localStorage
        saveStateToLocalStorage();

        // Se chegou a 2 vitórias => campeão do melhor de 3
        if (victories[team] >= 2) {
            // destacar modal
            const titleEl = victoryModal.querySelector('.victory-title');
            if (titleEl) titleEl.textContent = 'CAMPEÃO!';
            // desabilitar controles até o usuário resetar manualmente
            document.querySelectorAll('button, .increase-btn, .decrease-btn').forEach(b => b.disabled = true);
        }
    }

    closeVictory.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        // restaura título padrão
        const titleEl = victoryModal.querySelector('.victory-title');
        if (titleEl) titleEl.textContent = 'VITÓRIA!';
        // resetar apenas a rodada (pontuação), manter vitórias. Se houve campeão, manter estado até reset manual.
        resetarRodada();
        saveStateToLocalStorage();
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
        // resetar naipes para padrão
        teamData.team1.suit = '♦';
        teamData.team1.suitClass = 'diamond';
        teamData.team2.suit = '♦';
        teamData.team2.suitClass = 'diamond';
        const c1 = document.querySelector('#team1 .card');
        const c2 = document.querySelector('#team2 .card');
        if (c1) { c1.classList.remove('spade', 'heart'); c1.classList.add('diamond'); }
        if (c2) { c2.classList.remove('spade', 'heart'); c2.classList.add('diamond'); }

        // persiste
        saveStateToLocalStorage();
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
    // Carrega dados salvos (nomes e naipes) e estado de vitórias
    function loadStateFromLocalStorage() {
        try {
            const teams = JSON.parse(localStorage.getItem('trucoTeams') || '{}');
            if (teams.nos) {
                teamData.team1.name = teams.nos.name || teamData.team1.name;
                teamData.team1.suit = teams.nos.suit || teamData.team1.suit;
                // definir classe a partir do símbolo
                teamData.team1.suitClass = teams.nos.suitClass || (teamData.team1.suit === '♠' ? 'spade' : (teamData.team1.suit === '♥' ? 'heart' : 'diamond'));
            }
            if (teams.eles) {
                teamData.team2.name = teams.eles.name || teamData.team2.name;
                teamData.team2.suit = teams.eles.suit || teamData.team2.suit;
                teamData.team2.suitClass = teams.eles.suitClass || (teamData.team2.suit === '♠' ? 'spade' : (teamData.team2.suit === '♥' ? 'heart' : 'diamond'));
            }

            // carregar vitórias se existirem
            const savedVictories = JSON.parse(localStorage.getItem('trucoVictories') || '{}');
            if (typeof savedVictories.team1 === 'number') victories.team1 = savedVictories.team1;
            if (typeof savedVictories.team2 === 'number') victories.team2 = savedVictories.team2;
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    }

    function saveStateToLocalStorage() {
        try {
            const teams = {
                nos: { name: teamData.team1.name, suit: teamData.team1.suit, suitClass: teamData.team1.suitClass },
                eles: { name: teamData.team2.name, suit: teamData.team2.suit, suitClass: teamData.team2.suitClass }
            };
            localStorage.setItem('trucoTeams', JSON.stringify(teams));
            const savedVictories = { team1: victories.team1, team2: victories.team2 };
            localStorage.setItem('trucoVictories', JSON.stringify(savedVictories));
        } catch (e) {
            console.error('Erro ao salvar estado:', e);
        }
    }

    function applyTeamDataToUI() {
        // Nomes
        const name1 = document.querySelector('#team1 .team-name');
        const name2 = document.querySelector('#team2 .team-name');
        if (name1) name1.value = teamData.team1.name;
        if (name2) name2.value = teamData.team2.name;

        // Cartas (classe de naipe)
        const card1 = document.querySelector('#team1 .card');
        const card2 = document.querySelector('#team2 .card');
        if (card1) {
            card1.classList.remove('diamond', 'spade', 'heart');
            card1.classList.add(teamData.team1.suitClass || 'diamond');
        }
        if (card2) {
            card2.classList.remove('diamond', 'spade', 'heart');
            card2.classList.add(teamData.team2.suitClass || 'diamond');
        }
    }

    // quando o usuário edita o nome no marcador, atualizamos localStorage
    document.querySelectorAll('.team-name').forEach((input, idx) => {
        input.addEventListener('change', () => {
            const key = idx === 0 ? 'team1' : 'team2';
            teamData[key].name = input.value || teamData[key].name;
            // salvar mudanças
            saveStateToLocalStorage();
        });
    });

    // Inicialização com carregamento
    loadStateFromLocalStorage();
    applyTeamDataToUI();
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