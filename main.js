// SillyTavern Truth or Dare Extension - Final Hail Mary Version
// File: main.js

class TruthOrDareExtension {
    // ... (constructor and all other functions are identical to the last version) ...
    #isActive = false; #playerTurn = 'user'; #truths = []; #dares = [];
    constructor() { this.startGame = this.startGame.bind(this); this.stopGame = this.stopGame.bind(this); this.selectTruth = this.selectTruth.bind(this); this.selectDare = this.selectDare.bind(this); }
    async #loadGameData() { try { const truthsResponse = await fetch('/scripts/extensions/third-party/sillytavern-truth-or-dare/truths.json'); if (!truthsResponse.ok) { throw new Error(`Failed to load truths.json. Status: ${truthsResponse.status}`); } this.#truths = await truthsResponse.json(); const daresResponse = await fetch('/scripts/extensions/third-party/sillytavern-truth-or-dare/dares.json'); if (!daresResponse.ok) { throw new Error(`Failed to load dares.json. Status: ${daresResponse.status}`); } this.#dares = await daresResponse.json(); return true; } catch (error) { console.error('Truth or Dare: [FATAL] Could not load game data.', error); return false; } }
    #createUI(anchorElement) { const gameControls = document.createElement('div'); gameControls.id = 'truth-or-dare-controls'; gameControls.style.margin = '10px'; gameControls.style.padding = '10px'; gameControls.style.border = '1px solid var(--border-color)'; gameControls.style.borderRadius = 'var(--border-radius-big)'; gameControls.innerHTML = `<h4>Truth or Dare</h4><div id="tod-buttons"><button id="tod-start-btn" class="silly-button">Start Game</button><button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button><div id="tod-game-options" style="display: none; margin-top: 5px;"><button id="tod-truth-btn" class="silly-button">Truth</button><button id="tod-dare-btn" class="silly-button">Dare</button></div></div><div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>`; anchorElement.parentElement.insertBefore(gameControls, anchorElement); document.getElementById('tod-start-btn').addEventListener('click', this.startGame); document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame); document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth); document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare); }

    // *** THIS IS THE ONLY FUNCTION THAT HAS CHANGED ***
    #sendSystemMessage(message) {
        const chatInput = document.getElementById('send_textarea');
        const sendButton = document.getElementById('send_but');

        if (!chatInput || !sendButton) {
            console.error('Truth or Dare: Could not find chat elements.');
            return;
        }

        // This is a method to access the Vue/Svelte instance attached to an element.
        // It's a bit of a hack, but it's our best shot.
        const instanceKey = Object.keys(chatInput).find(key => key.startsWith('__vue'));
        if (!instanceKey) {
            console.error("Truth or Dare: Could not find the framework's internal instance key. This method won't work.");
            // Fallback to the previous method just in case.
            chatInput.value = `/sys ${message}`;
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            sendButton.click();
            return;
        }
        
        console.log("Truth or Dare: Found framework instance key:", instanceKey);

        // Directly set the value via the framework's own properties.
        // This is a common pattern for Vue instances.
        const originalValue = chatInput.value;
        const vnode = chatInput[instanceKey];
        
        // The path to the 'onInput' or 'update:modelValue' function might vary.
        // We are trying a common pattern.
        if (vnode && vnode.props && (vnode.props.onUpdate || vnode.props['onUpdate:modelValue'])) {
            const updateFunction = vnode.props.onUpdate || vnode.props['onUpdate:modelValue'];
            updateFunction({ target: { value: `/sys ${message}` } });

            // Now click the button
            sendButton.click();

            // Restore the value after a delay
            setTimeout(() => {
                updateFunction({ target: { value: originalValue } });
            }, 100);

            console.log("Truth or Dare: Sent message via framework's internal update function.");
        } else {
            console.error("Truth or Dare: Could not find the framework's update function on the vnode props.");
        }
    }
    
    // ... (All other functions are the same) ...
    startGame() { this.#isActive = true; this.#playerTurn = 'user'; this.#updateUIForTurn(); document.getElementById('tod-start-btn').style.display = 'none'; document.getElementById('tod-stop-btn').style.display = 'inline-block'; this.#sendSystemMessage('The Truth or Dare game has started!'); }
    stopGame() { this.#isActive = false; document.getElementById('tod-start-btn').style.display = 'inline-block'; document.getElementById('tod-stop-btn').style.display = 'none'; document.getElementById('tod-game-options').style.display = 'none'; document.getElementById('tod-status').textContent = ''; this.#sendSystemMessage('The Truth or Dare game has ended.'); }
    selectTruth() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`You chose Truth: ${randomTruth}`); this.#endTurn(); } }
    selectDare() { if (!this.#isActive || this.#playerTurn !== 'user') return; const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`You chose Dare: ${randomDare}`); this.#endTurn(); } }
    #endTurn() { this.#playerTurn = (this.playerTurn === 'user') ? 'character' : 'user'; this.#updateUIForTurn(); if (this.#playerTurn === 'character') { this.#handleCharacterTurn(); } }
    #handleCharacterTurn() { setTimeout(() => { const choice = Math.random() < 0.5 ? 'Truth' : 'Dare'; if (choice === 'Truth') { const randomTruth = this.#getRandomItem(this.#truths); if (randomTruth) { this.#sendSystemMessage(`The character chose Truth.`); setTimeout(() => this.#promptCharacter(`Truth for you: ${randomTruth}`), 1500); } } else { const randomDare = this.#getRandomItem(this.#dares); if (randomDare) { this.#sendSystemMessage(`The character chose Dare.`); setTimeout(() => this.#promptCharacter(`Dare for you: ${randomDare}`), 1500); } } setTimeout(() => this.#endTurn(), 4000); }, 2000); }
    #promptCharacter(prompt) { this.#sendSystemMessage(`*The character is asked:* "${prompt}" *They think for a moment and then respond.*`); }
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
