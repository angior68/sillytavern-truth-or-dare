// SillyTavern Truth or Dare Extension - Advanced AI Turn
// File: main.js
// CORRECTED FOR /scripts/extensions/ FOLDER STRUCTURE

// This class encapsulates the entire functionality of the Truth or Dare extension.
class TruthOrDareExtension {
    // Game state variables
    #isActive = false;
    #playerTurn = 'user';
    #truths = [];
    #dares = [];

    constructor() {
        // Bind 'this' to methods to ensure they have the correct context when called as event listeners.
        this.startGame = this.startGame.bind(this);
        this.stopGame = this.stopGame.bind(this);
        this.selectTruth = this.selectTruth.bind(this);
        this.selectDare = this.selectDare.bind(this);
    }

    /**
     * Asynchronously loads the truth and dare questions from JSON files.
     * This method is called when the extension is initialized.
     */
    async #loadGameData() {
        try {
            // Fetch the content of truths.json.
            // THIS PATH HAS BEEN UPDATED
            const truthsResponse = await fetch('/scripts/extensions/truth-or-dare/truths.json');
            if (!truthsResponse.ok) {
                throw new Error('Failed to load truths.json');
            }
            this.#truths = await truthsResponse.json();

            // Fetch the content of dares.json.
            // THIS PATH HAS BEEN UPDATED
            const daresResponse = await fetch('/scripts/extensions/truth-or-dare/dares.json');
            if (!daresResponse.ok) {
                throw new Error('Failed to load dares.json');
            }
            this.#dares = await daresResponse.json();

            console.log('Truth or Dare: Game data loaded successfully.');
        } catch (error) {
            console.error('Truth or Dare: Error loading game data:', error);
            alert('Failed to load Truth or Dare game data. Please check the console for errors.');
        }
    }

    /**
     * Creates and injects the game's UI elements into the SillyTavern interface.
     */
    #createUI() {
        const gameControls = document.createElement('div');
        gameControls.id = 'truth-or-dare-controls';
        gameControls.innerHTML = `
            <h4>Truth or Dare</h4>
            <div id="tod-buttons">
                <button id="tod-start-btn" class="silly-button">Start Game</button>
                <button id="tod-stop-btn" class="silly-button" style="display: none;">Stop Game</button>
                <div id="tod-game-options" style="display: none;">
                    <button id="tod-truth-btn" class="silly-button">Truth</button>
                    <button id="tod-dare-btn" class="silly-button">Dare</button>
                </div>
            </div>
            <div id="tod-status" style="margin-top: 10px; font-style: italic;"></div>
        `;

        document.querySelector('#form_content').append(gameControls);

        document.getElementById('tod-start-btn').addEventListener('click', this.startGame);
        document.getElementById('tod-stop-btn').addEventListener('click', this.stopGame);
        document.getElementById('tod-truth-btn').addEventListener('click', this.selectTruth);
        document.getElementById('tod-dare-btn').addEventListener('click', this.selectDare);
    }

    // ... (The rest of the file is exactly the same as before) ...

    /**
     * Starts the Truth or Dare game.
     */
    startGame() {
        this.#isActive = true;
        this.#playerTurn = 'user';
        console.log('Truth or Dare: Game started.');
        this.#updateUIForTurn();
        document.getElementById('tod-start-btn').style.display = 'none';
        document.getElementById('tod-stop-btn').style.display = 'inline-block';
        this.#sendSystemMessage('The Truth or Dare game has started!');
    }

    /**
     * Stops the Truth or Dare game.
     */
    stopGame() {
        this.#isActive = false;
        console.log('Truth or Dare: Game stopped.');
        document.getElementById('tod-start-btn').style.display = 'inline-block';
        document.getElementById('tod-stop-btn').style.display = 'none';
        document.getElementById('tod-game-options').style.display = 'none';
        document.getElementById('tod-status').textContent = '';
        this.#sendSystemMessage('The Truth or Dare game has ended.');
    }

    /**
     * Handles the user's choice of "Truth".
     */
    selectTruth() {
        if (!this.#isActive || this.#playerTurn !== 'user') return;
        const randomTruth = this.#getRandomItem(this.#truths);
        if (randomTruth) {
            this.#sendSystemMessage(`You chose Truth: ${randomTruth}`);
            this.#endTurn();
        }
    }

    /**
     * Handles the user's choice of "Dare".
     */
    selectDare() {
        if (!this.#isActive || this.#playerTurn !== 'user') return;
        const randomDare = this.#getRandomItem(this.#dares);
        if (randomDare) {
            this.#sendSystemMessage(`You chose Dare: ${randomDare}`);
            this.#endTurn();
        }
    }

    /**
     * Ends the current player's turn and switches to the other player.
     */
    #endTurn() {
        this.#playerTurn = (this.#playerTurn === 'user') ? 'character' : 'user';
        this.#updateUIForTurn();
        if (this.#playerTurn === 'character') {
            this.#handleCharacterTurn();
        }
    }

    /**
     * Manages the AI character's turn.
     */
    #handleCharacterTurn() {
        setTimeout(() => {
            const choice = Math.random() < 0.5 ? 'Truth' : 'Dare';
            if (choice === 'Truth') {
                const randomTruth = this.#getRandomItem(this.#truths);
                if (randomTruth) {
                    this.#sendSystemMessage(`The character chose Truth.`);
                    setTimeout(() => this.#promptCharacter(`Truth for you: ${randomTruth}`), 1500);
                }
            } else {
                const randomDare = this.#getRandomItem(this.#dares);
                if (randomDare) {
                    this.#sendSystemMessage(`The character chose Dare.`);
                    setTimeout(() => this.#promptCharacter(`Dare for you: ${randomDare}`), 1500);
                }
            }
            setTimeout(() => this.#endTurn(), 4000);
        }, 2000);
    }

    /**
     * Sends a prompt to the character and has them generate a response.
     */
    #promptCharacter(prompt) {
        const chatInput = document.getElementById('send_textarea');
        const sendButton = document.getElementById('send_but');
        if (chatInput && sendButton) {
            const originalValue = chatInput.value;
            chatInput.value = `/sys *The character is asked:* "${prompt}" *They think for a moment and then respond.*`;
            sendButton.click();
            chatInput.value = originalValue;
        } else {
            console.error('Truth or Dare: Could not find chat input or send button.');
        }
    }

    /**
     * Updates the UI elements based on whose turn it is.
     */
    #updateUIForTurn() {
        const gameOptions = document.getElementById('tod-game-options');
        const statusDisplay = document.getElementById('tod-status');
        if (this.#playerTurn === 'user') {
            gameOptions.style.display = 'block';
            statusDisplay.textContent = "It's your turn. Choose Truth or Dare.";
        } else {
            gameOptions.style.display = 'none';
            statusDisplay.textContent = "It's the character's turn...";
        }
    }

    /**
     * Selects a random item from an array.
     */
    #getRandomItem(array) {
        if (!array || array.length === 0) {
            console.error('Truth or Dare: The array is empty.');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    /**
     * Sends a message to the SillyTavern chat as a system message.
     */
    #sendSystemMessage(message) {
        const chatInput = document.getElementById('send_textarea');
        const sendButton = document.getElementById('send_but');
        if (chatInput && sendButton) {
            const originalValue = chatInput.value;
            chatInput.value = `/sys ${message}`;
            sendButton.click();
            chatInput.value = originalValue;
        } else {
            console.error('Truth or Dare: Could not find chat input or send button.');
        }
    }

    /**
     * This method is called by SillyTavern when the extension is loaded.
     */
    onLoad() {
        this.#loadGameData().then(() => {
            this.#createUI();
            console.log('Truth or Dare extension loaded successfully.');
        });
    }
}

// Create an instance of the extension and initialize it.
(function() {
    const truthOrDare = new TruthOrDareExtension();
    setTimeout(() => truthOrDare.onLoad(), 1000);
})();
