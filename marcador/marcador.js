document.addEventListener('DOMContentLoaded', () => {

    const mapping = { team1: 'nos', team2: 'eles' };

    Object.keys(mapping).forEach(teamId => {

        const teamEl = document.getElementById(teamId);
        if (!teamEl) return;

        const key = 'teamSkin_' + mapping[teamId];
        const raw = localStorage.getItem(key);

        // valores padrão
        let skinData = {
            front: '/image/padrao/frente.png',
            back: '/image/padrao/verso.png',
            isDarkBlack: '#000000',
            isLightBlack: '#777777',
            isDarkRed: '#e22929',
            isLightRed: '#ff4d4d',
            fontColor: null,
            isCustom: false
        };

        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed.front) skinData.front = parsed.front;
                if (parsed.back) skinData.back = parsed.back;
                if (parsed.fontColor) skinData.fontColor = parsed.fontColor;
                if (parsed.isCustom === true) skinData.isCustom = true;
            } catch (err) {
                console.warn('Erro ao parsear skin:', err);
            }
        }

        const isDefaultSkin = (skinData.front === '/image/padrao/frente.png' && skinData.back === '/image/padrao/verso.png');

        const card = teamEl.querySelector('.card');
        if (!card) return;
        const frontEl = card.querySelector('.front');
        const backEl = card.querySelector('.back');

        // aplica imagens
        if (frontEl) {
            frontEl.style.backgroundImage = `url("${skinData.front}")`;
            frontEl.style.backgroundSize = '120% 120%';
            frontEl.style.backgroundPosition = 'center';
            frontEl.style.backgroundRepeat = 'no-repeat';
        }
        if (backEl) {
            backEl.style.backgroundImage = `url("${skinData.back}")`;
            backEl.style.backgroundSize = '120% 121%';
            backEl.style.backgroundPosition = 'center';
            backEl.style.backgroundRepeat = 'no-repeat';
        }

        // cores globais (preto/cinza sempre aplicados)
        card.style.setProperty('--darkBlack', skinData.isDarkBlack);
        card.style.setProperty('--lightBlack', skinData.isLightBlack);

        if (isDefaultSkin) {
            // Skin padrão: força fontes pretas independentemente do naipe escolhido
            card.style.setProperty('--darkRed', skinData.isDarkBlack);
            card.style.setProperty('--lightRed', skinData.isLightBlack);

            // override inline para garantir que todos os textos/naipe fiquem pretos
            card.querySelectorAll('.heart, .diamond, .spade, .club, .num-box').forEach(el => {
                el.style.color = skinData.isDarkBlack;
            });

        } else {
            // Skin alternativa/customizada: cores dependem do naipe
            card.style.setProperty('--darkRed', skinData.isDarkRed);
            card.style.setProperty('--lightRed', skinData.isLightRed);

            if (skinData.fontColor && skinData.isCustom) {
                // custom + cor escolhida pelo usuário: aplica ao texto
                card.style.setProperty('--fontColor', skinData.fontColor);
                card.querySelectorAll('.num-box').forEach(el => el.style.color = skinData.fontColor);
            } else {
                // comportamento padrão por naipe
                card.querySelectorAll('.heart, .diamond').forEach(el => el.style.color = skinData.isDarkRed);
                card.querySelectorAll('.spade, .club').forEach(el => el.style.color = skinData.isDarkBlack);
                card.querySelectorAll('.num-box').forEach(el => el.style.color = '');
            }
        }

    });
});

// =========================================================
// ====      SISTEMA DE PONTOS / TRUCO / MODAL          ====
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

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

    let scores = { team1: 0, team2: 0 };
    let victories = { team1: 0, team2: 0 };

    let teamData = {
        team1: { name: 'Time 1', suit: '♦', suitClass: 'diamond' },
        team2: { name: 'Time 2', suit: '♠', suitClass: 'spade' } // alterar para spade por padrão
    };

    const naipes = ['diamond', 'spade', 'heart'];

    let trucoAtivo = false;
    let trucoIndex = 0;
    const trucoValues = [3, 6, 9, 12];

    let valorMarcador = 1;
    let valorMarcadorAnterior = 1;

    function atualizarMarcadores() {
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.textContent = `+${valorMarcador}`;
        });

        if (trucoAtivo && valorMarcador === 12) {
            resetTrucoBtn.style.display = 'inline-block';
            mainTrucoBtn.style.display = 'none';
        } else {
            resetTrucoBtn.style.display = 'none';
            mainTrucoBtn.style.display = 'inline-block';
        }
    }

    function atualizarPlacar() {
        score1Els.forEach(el => el.textContent = scores.team1);
        score2Els.forEach(el => el.textContent = scores.team2);

        mainTrucoBtn.disabled = scores.team1 >= 11 || scores.team2 >= 11;
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
        trucoIndex = 0;
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
        setTimeout(() => card.classList.remove('flip'), 500);
    }

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
            flipCard(team);

            setTimeout(() => {
                scores[team] = Math.max(0, scores[team] - 1);
                atualizarPlacar();
            }, 500);
        });
    });

    mainTrucoBtn.addEventListener('click', function () {
        if (!trucoAtivo) {

            trucoAtivo = true;
            trucoIndex = 0;
            valorMarcadorAnterior = valorMarcador;
            valorMarcador = trucoValues[trucoIndex];

            mainTrucoBtn.textContent = trucoValues[trucoIndex + 1];
            runBtn.style.display = 'inline-block';

            trucoStatus1.textContent = 'Rodada de Truco!';
            trucoStatus2.textContent = 'Rodada de Truco!';

            atualizarMarcadores();

        } else if (trucoIndex < trucoValues.length - 1) {

            trucoIndex++;
            valorMarcadorAnterior = valorMarcador;
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
        trucoAtivo = false;
        trucoIndex = 0;
        valorMarcador = valorMarcadorAnterior;
        atualizarMarcadores();
        mainTrucoBtn.textContent = 'Truco';
        runBtn.style.display = 'none';
        trucoStatus1.textContent = '';
        trucoStatus2.textContent = '';
    });

    function mostrarVitoria(team) {

        setTimeout(() => resetarRodada(), 500);

        const inputEl = document.querySelector(`#${team} .team-name`);
        const teamName = inputEl ? inputEl.value : teamData[team].name;

        victories[team]++;
        atualizarVitorias();

        victoryTeamName.textContent = teamName;
        victoryModal.classList.add('active');

        const card = document.querySelector(`#${team} .card`);
        if (card) {
            card.classList.remove('diamond', 'spade', 'heart');

            const current = teamData[team].suitClass;
            const idx = naipes.indexOf(current);
            const nextClass = naipes[(idx + 1) % naipes.length];

            card.classList.add(nextClass);
            teamData[team].suitClass = nextClass;

            const map = { diamond: '♦', spade: '♠', heart: '♥' };
            teamData[team].suit = map[nextClass];
        }

        saveStateToLocalStorage();

        if (victories[team] >= 2) {
            const title = victoryModal.querySelector('.victory-title');
            if (title) title.textContent = 'CAMPEÃO!';

            document.querySelectorAll('button, .increase-btn, .decrease-btn').forEach(b => b.disabled = true);
        }
    }

    closeVictory.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        const t = victoryModal.querySelector('.victory-title');
        if (t) t.textContent = 'VITÓRIA!';
        resetarRodada();
        saveStateToLocalStorage();
    });

    victoryModal.addEventListener('click', e => {
        if (e.target === victoryModal) {
            victoryModal.classList.remove('active');
            resetarRodada();
        }
    });

    resetPointsBtn.addEventListener('click', resetarRodada);

    resetVictoriesBtn.addEventListener('click', () => {
        victories.team1 = 0;
        victories.team2 = 0;
        atualizarVitorias();

        teamData.team1.suit = '♦';
        teamData.team1.suitClass = 'diamond';

        teamData.team2.suit = '♠';
        teamData.team2.suitClass = 'spade';

        document.querySelector('#team1 .card').className = 'card diamond';
        document.querySelector('#team2 .card').className = 'card spade';

        saveStateToLocalStorage();
    });

    editIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            input.focus();
            input.select();
        });
    });

    function loadStateFromLocalStorage() {
        try {
            const teams = JSON.parse(localStorage.getItem('trucoTeams') || '{}');

            if (teams.nos) {
                teamData.team1.name = teams.nos.name;
                teamData.team1.suit = teams.nos.suit;
                teamData.team1.suitClass = teams.nos.suitClass;
            }

            if (teams.eles) {
                teamData.team2.name = teams.eles.name;
                teamData.team2.suit = teams.eles.suit;
                teamData.team2.suitClass = teams.eles.suitClass;
            }

            const savedVictories = JSON.parse(localStorage.getItem('trucoVictories') || '{}');
            victories.team1 = savedVictories.team1 || 0;
            victories.team2 = savedVictories.team2 || 0;

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
            localStorage.setItem('trucoVictories', JSON.stringify(victories));

        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    }

    function applyTeamDataToUI() {
        const name1 = document.querySelector('#team1 .team-name');
        const name2 = document.querySelector('#team2 .team-name');

        name1.value = teamData.team1.name;
        name2.value = teamData.team2.name;

        const card1 = document.querySelector('#team1 .card');
        const card2 = document.querySelector('#team2 .card');

        card1.classList.remove('diamond', 'spade', 'heart');
        card1.classList.add(teamData.team1.suitClass);

        card2.classList.remove('diamond', 'spade', 'heart');
        card2.classList.add(teamData.team2.suitClass);
    }

    document.querySelectorAll('.team-name').forEach((input, idx) => {
        input.addEventListener('change', () => {
            const key = idx === 0 ? 'team1' : 'team2';
            teamData[key].name = input.value;
            saveStateToLocalStorage();
        });
    });

    loadStateFromLocalStorage();
    applyTeamDataToUI();
    atualizarVitorias();
});
