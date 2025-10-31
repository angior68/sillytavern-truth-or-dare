// SillyTavern Truth or Dare Extension - Final Robust UI Version
// File: main.js

class TruthOrDareExtension {
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

    async #loadGameData() {
        try {
            const truthsResponse = await fetch('/scripts/extensions/third-party/sillytavern-truth-or-dare/truths.json');
            if (!truthsResponse.ok) { throw new Error(`Failed to load truths.json. Status: ${truthsResponse.status}`); }
            this.#truths = await truthsResponse.json();

            const daresResponse = await fetch('/scripts/extensions/third-party/sillytavern-truth-or-dare/dares.json');
            if (!daresResponse.ok) { throw new Error(`Failed to load dares.json. Status: ${daresResponse.status}`); }
            this.#dares = await daresResponse.json();
            
            console.log('Truth or Dare: [SUCCESS] Game data loaded.');
            return true; // Indicate success
        } catch (error) {
            console.error('Truth or Dare: [FATAL] Could not load game data.', error);
            alert('Truth or Dare: Could not load game data. See F12 console.');
            return false; // Indicate failure
        }
    }

    #createUI(targetElement) {
        console.log('Truth or Dare: [INFO] createUI function called.');
        if (!targetElement) {
            console.error('Truth or Dare: [FATAL] createUI was called with an invalid target element.');
            return;
        }

        const gameControls = document.createElement('div');
        gameControls.id = 'truth-or-dare-controls';
        gameControls.style.margin = '10px';
        gameControls.style.padding = '10px';
        gameControls.style.border = '1px solid var(--border-color)';
        gameControls.style.borderRadius = 'var(--border-radius-big)';
        gameControls.style.display = 'block'; // Force it to be visible

        gameControls.innerHTML = `<h4>Truth or Dare</h4><div id="tod-buttons"><button id="tod-start-btn" class="silly-button">Start Game</button><button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button><div id="tod-game-options" style="display: none; margin-top: 5px;"><button id="tod-truth-btn" class="silly-button">Truth</button><button id="tod-dare-btn" class="silly-button">Dare</button></div></div><div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>`;
        
        try {
            targetElement.append(gameControls);
            document.getElementById('tod-start-btn').addEventListener('click', this.startGame);
            document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame);
            document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth);
            document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare);
            console.log('Truth or Dare: [SUCCESS] UI created and attached.');
        } catch (error) {
            console.error('Truth or Dare: [FATAL] An error occurred while attaching the UI.', error);
        }
    }

    // ... (The rest of the game logic functions are identical) ...
    startGame() { this.#isActive = true; this.#playerTurn = 'user'; this.#updateUIForTurn(); document.getElementById('tod-start-btn').style.display = 'none'; document.getElementById('tod-stop-btn').style.display = 'inline-block'; this.#sendSystemMessage('The Truth or Dare game has started!'); }
    stopGame() { this.#isActive = false; document.getElementById('tod-start-btn').style.display = 'inline-block'; document.getElementById('tod-stop-btn').style.display = 'none'; document.getElementById('tod-game-options').style.display = 'none'; document.getElementById('tod-status').textContent = ''; this.#sendSystemMessage('The Truth or Dare game has ended.'); }
    selectTruth() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`You chose Truth: ${randomTruth}`); this.#endTurn(); } }
    selectDare() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`You chose Dare: ${randomDare}`); this.#endTurn(); } }
    #endTurn() { this.#playerTurn = (this.#playerTurn === 'user') ? 'character' : 'user'; this.#updateUIForTurn(); if (this.#playerTurn === 'character') { this.#handleCharacterTurn(); } }
    #handleCharacterTurn() { setTimeout(() => { const choice = Math.random() < 0.5 ? 'Truth' : 'Dare'; if (choice === 'Truth') { const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`The character chose Truth.`); setTimeout(() => this.#promptCharacter(`Truth for you: ${randomTruth}`), 1500); } } else { const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`The character chose Dare.`); setTimeout(() => this.#promptCharacter(`Dare for you: ${randomDare}`), 1500); } } setTimeout(() => this.#endTurn(), 4000); }, 2000); }
    #promptCharacter(prompt) { const chatInput = document.getElementById('send_textarea'); const sendButton = document.getElementById('send_but'); if (chatInput && sendButton) { const originalValue = chatInput.value; chatInput.value = `/sys *The character is asked:* "${prompt}" *They think for a moment and then respond.*`; sendButton.click(); chatInput.value = originalValue; } }
    #updateUIForTurn() { const gameOptions = document.getElementById('tod-game-options'); const statusDisplay = document.getElementById('tod-status'); if (this.#playerTurn === 'user') { gameOptions.style.display = 'block'; statusDisplay.textContent = "It's your turn. Choose Truth or Dare."; } else { gameOptions.style.display = 'none'; statusDisplay.textContent = "It's the character's turn..."; } }
    #getRandomItem(array) { if (!array || array.length === 0) return null; const randomIndex = Math.floor(Math.random() * array.length); return array[randomIndex]; }
    #sendSystemMessage(message) { const chatInput = document.getElementById('send_textarea'); const sendButton = document.getElementById('send_but'); if (chatInput && sendButton) { const originalValue = chatInput.value; chatInput.value = `/sys ${message}`; sendButton.click(); chatInput.value = originalValue; } }

    onLoad() {
        this.#loadGameData().then(success => {
            if (!success) {
                console.error("Truth or Dare: [HALT] Halting execution because game data failed to load.");
                return;
            }

            // More robust UI waiting logic
            let attempts = 0;
            const maxAttempts = 100; // Wait for a maximum of 10 seconds
            const interval = setInterval(() => {
                attempts++;
                const chatForm = document.querySelector('#chat_form');
                
                if (chatForm) {
                    console.log(`Truth or Dare: [INFO] Found #chat_form after ${attempts} attempts.`);
                    clearInterval(interval);
                    this.#createUI(chatForm);
                } else if (attempts > maxAttempts) {
                    clearInterval(interval);
                    console.error("Truth or Dare: [FATAL] Timed out waiting for #chat_form to appear. Extension will not load.");
                    alert("Truth or Dare extension could not find the chat input form. It may be incompatible with this version of SillyTavern.");
                }
            }, 100); // Check every 100 milliseconds
        });
    }
}

// Global entry point
(function() {
    try {
        const truthOrDare = new TruthOrDareExtension();
        truthOrDare.onLoad();
    } catch (error) {
        console.error("Truth or Dare: [FATAL] A critical error occurred during initial script execution.", error);
        alert("A fatal error occurred while loading the Truth or Dare extension. Check the F12 console.");
    }
})();
