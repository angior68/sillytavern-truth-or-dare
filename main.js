// SillyTavern Truth or Dare Extension - HEAVY DEBUGGING Version
// File: main.js

class TruthOrDareExtension {
    // ... (All the variables and the constructor are the same) ...
    #isActive = false;
    #playerTurn = 'user';
    #truths = [];
    #dares = [];

    constructor() {
        console.log('Truth or Dare: 1. Constructor has been called.');
        this.startGame = this.startGame.bind(this);
        this.stopGame = this.stopGame.bind(this);
        this.selectTruth = this.selectTruth.bind(this);
        this.selectDare = this.selectDare.bind(this);
    }

    async #loadGameData() {
        console.log('Truth or Dare: 4. Attempting to load game data...');
        try {
            const truthsResponse = await fetch('\extensions\sillytavern-truth-or-dare\truths.json');
            if (!truthsResponse.ok) { throw new Error(`Failed to load truths.json. Status: ${truthsResponse.status}`); }
            this.#truths = await truthsResponse.json();
            console.log('Truth or Dare: 5. truths.json loaded successfully.');

            const daresResponse = await fetch('\extensions\sillytavern-truth-or-dare\dares.json');
            if (!daresResponse.ok) { throw new Error(`Failed to load dares.json. Status: ${daresResponse.status}`); }
            this.#dares = await daresResponse.json();
            console.log('Truth or Dare: 6. dares.json loaded successfully.');

        } catch (error) {
            console.error('Truth or Dare: CRITICAL ERROR during loadGameData.', error);
            alert('Truth or Dare: CRITICAL ERROR loading game data. Check the F12 Developer Console.');
        }
    }

    #createUI() {
        console.log('Truth or Dare: 9. createUI function has been called.');
        const gameControls = document.createElement('div');
        gameControls.id = 'truth-or-dare-controls';
        gameControls.style.margin = '10px';
        gameControls.style.padding = '10px';
        gameControls.style.border = '1px solid var(--border-color)';
        gameControls.style.borderRadius = 'var(--border-radius-big)';

        gameControls.innerHTML = `<h4>Truth or Dare</h4><div id="tod-buttons"><button id="tod-start-btn" class="silly-button">Start Game</button><button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button><div id="tod-game-options" style="display: none; margin-top: 5px;"><button id="tod-truth-btn" class="silly-button">Truth</button><button id="tod-dare-btn" class="silly-button">Dare</button></div></div><div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>`;
        
        try {
            const chatForm = document.querySelector('#chat_form');
            if (chatForm) {
                chatForm.append(gameControls);
                console.log('Truth or Dare: 10. SUCCESS! UI attached to #chat_form.');
            } else {
                console.error('Truth or Dare: FATAL! Could not find the #chat_form element.');
                return;
            }

            document.getElementById('tod-start-btn').addEventListener('click', this.startGame);
            document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame);
            document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth);
            document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare);
        } catch (error) {
            console.error('Truth or Dare: CRITICAL ERROR during UI creation.', error);
        }
    }

    // ... (The rest of the file - startGame, stopGame, etc. - is exactly the same) ...
    startGame() { this.#isActive = true; this.#playerTurn = 'user'; console.log('Truth or Dare: Game started.'); this.#updateUIForTurn(); document.getElementById('tod-start-btn').style.display = 'none'; document.getElementById('tod-stop-btn').style.display = 'inline-block'; this.#sendSystemMessage('The Truth or Dare game has started!'); }
    stopGame() { this.#isActive = false; console.log('Truth or Dare: Game stopped.'); document.getElementById('tod-start-btn').style.display = 'inline-block'; document.getElementById('tod-stop-btn').style.display = 'none'; document.getElementById('tod-game-options').style.display = 'none'; document.getElementById('tod-status').textContent = ''; this.#sendSystemMessage('The Truth or Dare game has ended.'); }
    selectTruth() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`You chose Truth: ${randomTruth}`); this.#endTurn(); } }
    selectDare() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`You chose Dare: ${randomDare}`); this.#endTurn(); } }
    #endTurn() { this.#playerTurn = (this.#playerTurn === 'user') ? 'character' : 'user'; this.#updateUIForTurn(); if (this.#playerTurn === 'character') { this.#handleCharacterTurn(); } }
    #handleCharacterTurn() { setTimeout(() => { const choice = Math.random() < 0.5 ? 'Truth' : 'Dare'; if (choice === 'Truth') { const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`The character chose Truth.`); setTimeout(() => this.#promptCharacter(`Truth for you: ${randomTruth}`), 1500); } } else { const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`The character chose Dare.`); setTimeout(() => this.#promptCharacter(`Dare for you: ${randomDare}`), 1500); } } setTimeout(() => this.#endTurn(), 4000); }, 2000); }
    #promptCharacter(prompt) { const chatInput = document.getElementById('send_textarea'); const sendButton = document.getElementById('send_but'); if (chatInput && sendButton) { const originalValue = chatInput.value; chatInput.value = `/sys *The character is asked:* "${prompt}" *They think for a moment and then respond.*`; sendButton.click(); chatInput.value = originalValue; } else { console.error('Truth or Dare: Could not find chat input or send button.'); } }
    #updateUIForTurn() { const gameOptions = document.getElementById('tod-game-options'); const statusDisplay = document.getElementById('tod-status'); if (this.#playerTurn === 'user') { gameOptions.style.display = 'block'; statusDisplay.textContent = "It's your turn. Choose Truth or Dare."; } else { gameOptions.style.display = 'none'; statusDisplay.textContent = "It's the character's turn..."; } }
    #getRandomItem(array) { if (!array || array.length === 0) { console.error('Truth or Dare: The array is empty.'); return null; } const randomIndex = Math.floor(Math.random() * array.length); return array[randomIndex]; }
    #sendSystemMessage(message) { const chatInput = document.getElementById('send_textarea'); const sendButton = document.getElementById('send_but'); if (chatInput && sendButton) { const originalValue = chatInput.value; chatInput.value = `/sys ${message}`; sendButton.click(); chatInput.value = originalValue; } else { console.error('Truth or Dare: Could not find chat input or send button.'); } }

    onLoad() {
        console.log('Truth or Dare: 3. onLoad function has been called.');
        this.#loadGameData().then(() => {
            console.log('Truth or Dare: 7. Game data promise resolved. Starting UI wait loop.');
            const interval = setInterval(() => {
                const chatForm = document.querySelector('#chat_form');
                if (chatForm) {
                    console.log('Truth or Dare: 8. Found #chat_form. Clearing interval and creating UI.');
                    clearInterval(interval);
                    this.#createUI();
                }
            }, 100);
        });
    }
}

console.log('Truth or Dare: 0. main.js script is being executed.');
(function() {
    const truthOrDare = new TruthOrDareExtension();
    truthOrDare.onLoad();
    console.log('Truth or Dare: 2. Initial execution block has finished.');
})();
