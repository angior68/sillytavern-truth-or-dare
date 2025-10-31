// SillyTavern Truth or Dare Extension - Final Working Version
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
            return true;
        } catch (error) {
            console.error('Truth or Dare: [FATAL] Could not load game data.', error);
            return false;
        }
    }

    #createUI(anchorElement) {
        const gameControls = document.createElement('div');
        gameControls.id = 'truth-or-dare-controls';
        gameControls.style.margin = '10px';
        gameControls.style.padding = '10px';
        gameControls.style.border = '1px solid var(--border-color)';
        gameControls.style.borderRadius = 'var(--border-radius-big)';

        gameControls.innerHTML = `<h4>Truth or Dare</h4><div id="tod-buttons"><button id="tod-start-btn" class="silly-button">Start Game</button><button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button><div id="tod-game-options" style="display: none; margin-top: 5px;"><button id="tod-truth-btn" class="silly-button">Truth</button><button id="tod-dare-btn" class="silly-button">Dare</button></div></div><div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>`;
        
        anchorElement.parentElement.insertBefore(gameControls, anchorElement);
        document.getElementById('tod-start-btn').addEventListener('click', this.startGame);
        document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame);
        document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth);
        document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare);
        console.log('Truth or Dare: [SUCCESS] UI created and attached.');
    }

    // *** THIS IS THE ONLY FUNCTION THAT HAS CHANGED ***
    #sendSystemMessage(message) {
        const chatInput = document.getElementById('send_textarea');
        if (!chatInput) {
            console.error('Truth or Dare: Could not find #send_textarea.');
            return;
        }

        // Find the parent form of the text area. This is the robust method.
        const chatForm = chatInput.closest('form');
        if (!chatForm) {
            console.error('Truth or Dare: Could not find parent form of the chat input.');
            return;
        }

        const originalValue = chatInput.value;
        chatInput.value = `/sys ${message}`;

        // Create and dispatch a "submit" event on the form itself.
        // This is much more reliable than trying to .click() a div.
        const submitEvent = new SubmitEvent('submit', { bubbles: true, cancelable: true });
        chatForm.dispatchEvent(submitEvent);

        // Restore the original input value shortly after, allowing the submit to process.
        setTimeout(() => { chatInput.value = originalValue; }, 10);
    }

    // All other functions are the same as the previous working version
    startGame() { this.#isActive = true; this.#playerTurn = 'user'; this.#updateUIForTurn(); document.getElementById('tod-start-btn').style.display = 'none'; document.getElementById('tod-stop-btn').style.display = 'inline-block'; this.#sendSystemMessage('The Truth or Dare game has started!'); }
    stopGame() { this.#isActive = false; document.getElementById('tod-start-btn').style.display = 'inline-block'; document.getElementById('tod-stop-btn').style.display = 'none'; document.getElementById('tod-game-options').style.display = 'none'; document.getElementById('tod-status').textContent = ''; this.#sendSystemMessage('The Truth or Dare game has ended.'); }
    selectTruth() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`You chose Truth: ${randomTruth}`); this.#endTurn(); } }
    selectDare() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`You chose Dare: ${randomDare}`); this.#endTurn(); } }
    #endTurn() { this.#playerTurn = (this.#playerTurn === 'user') ? 'character' : 'user'; this.#updateUIForTurn(); if (this.#playerTurn === 'character') { this.#handleCharacterTurn(); } }
    #handleCharacterTurn() { setTimeout(() => { const choice = Math.random() < 0.5 ? 'Truth' : 'Dare'; if (choice === 'Truth') { const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`The character chose Truth.`); setTimeout(() => this.#promptCharacter(`Truth for you: ${randomTruth}`), 1500); } } else { const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`The character chose Dare.`); setTimeout(() => this.#promptCharacter(`Dare for you: ${randomDare}`), 1500); } } setTimeout(() => this.#endTurn(), 4000); }, 2000); }
    #promptCharacter(prompt) { this.#sendSystemMessage(`*The character is asked:* "${prompt}" *They think for a moment and then respond.*`); } // Simplified to use the main send function
    #updateUIForTurn() { const gameOptions = document.getElementById('tod-game-options'); const statusDisplay = document.getElementById('tod-status'); if (this.#playerTurn === 'user') { gameOptions.style.display = 'block'; statusDisplay.textContent = "It's your turn. Choose Truth or Dare."; } else { gameOptions.style.display = 'none'; statusDisplay.textContent = "It's the character's turn..."; } }
    #getRandomItem(array) { if (!array || array.length === 0) return null; const randomIndex = Math.floor(Math.random() * array.length); return array[randomIndex]; }

    onLoad() {
        this.#loadGameData().then(success => {
            if (!success) { return; }
            let attempts = 0;
            const maxAttempts = 100;
            const interval = setInterval(() => {
                attempts++;
                const anchorElement = document.getElementById('send_textarea');
                if (anchorElement) {
                    clearInterval(interval);
                    this.#createUI(anchorElement);
                } else if (attempts > maxAttempts) {
                    clearInterval(interval);
                }
            }, 100);
        });
    }
}

(function() {
    try {
        const truthOrDare = new TruthOrDareExtension();
        truthOrDare.onLoad();
    } catch (error) {
        console.error("Truth or Dare: [FATAL] A critical error occurred during initial script execution.", error);
    }
})();
