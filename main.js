// SillyTavern Truth or Dare Extension - Final Robust Version for Staging UI
// File: main.js

class TruthOrDareExtension {
    // ... (All the variables and the constructor are the same) ...
    #isActive = false;
    #playerTurn = 'user';
    #truths = [];
    #dares = [];

    constructor() {
        this.startGame = this.startGame.bind(this);
        this.stopGame = this.stopGame.bind(this);
        this.selectTruth = this.selectTruth.bind(this);
        this.selectDare = this.selectDare.bind(this);
    }

    // ... (#loadGameData is the same) ...
    async #loadGameData() {
        try {
            const truthsResponse = await fetch('/truths.json');
            if (!truthsResponse.ok) { throw new Error('Failed to load truths.json'); }
            this.#truths = await truthsResponse.json();

            const daresResponse = await fetch('/dares.json');
            if (!daresResponse.ok) { throw new Error('Failed to load dares.json'); }
            this.#dares = await daresResponse.json();

            console.log('Truth or Dare: Game data loaded successfully.');
        } catch (error) {
            console.error('Truth or Dare: Error loading game data:', error);
            alert('Failed to load Truth or Dare game data. Please check the console for errors.');
        }
    }

    #createUI() {
        const gameControls = document.createElement('div');
        gameControls.id = 'truth-or-dare-controls';
        gameControls.style.margin = '10px';
        gameControls.style.padding = '10px';
        gameControls.style.border = '1px solid var(--border-color)';
        gameControls.style.borderRadius = 'var(--border-radius-big)';

        gameControls.innerHTML = `
            <h4>Truth or Dare</h4>
            <div id="tod-buttons">
                <button id="tod-start-btn" class="silly-button">Start Game</button>
                <button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button>
                <div id="tod-game-options" style="display: none; margin-top: 5px;">
                    <button id="tod-truth-btn" class="silly-button">Truth</button>
                    <button id="tod-dare-btn" class="silly-button">Dare</button>
                </div>
            </div>
            <div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>
        `;
        
        try {
            // This is the updated, more robust part
            const chatForm = document.querySelector('#chat_form');
            if (chatForm) {
                chatForm.append(gameControls);
                console.log('Truth or Dare: UI successfully attached to #chat_form.');
            } else {
                // If it still can't be found, log a clear error.
                console.error('Truth or Dare: Could not find the #chat_form element to attach the UI.');
                return; // Stop execution if UI can't be placed.
            }

            // Attach event listeners only if the UI was successfully created.
            document.getElementById('tod-start-btn').addEventListener('click', this.startGame);
            document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame);
            document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth);
            document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare);
        } catch (error) {
            console.error('Truth or Dare: An error occurred during UI creation.', error);
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
        // We will wait for the data to load first
        this.#loadGameData().then(() => {
            // **THIS IS THE NEW PATIENT LOGIC**
            // We will repeatedly check for the UI element every 100ms
            const interval = setInterval(() => {
                const chatForm = document.querySelector('#chat_form');
                if (chatForm) {
                    clearInterval(interval); // Stop checking once we find it
                    this.#createUI(); // Create the UI
                }
            }, 100); // Check every 100 milliseconds
        });
    }
}

(function() {
    // No need for a timeout here anymore, the class handles it.
    const truthOrDare = new TruthOrDareExtension();
    truthOrDare.onLoad();
})();
