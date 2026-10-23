/**
 * The current instance of the game.
 * @type {Blackjack|null}
 */
let game = null;

/**
 * True while the dealer plays his turn step by step.
 * @type {boolean}
 */
let dealerPlaying = false;

/**
 * Chips, unlocked themes, active theme and bet of the round.
 * @type {Wallet}
 */
const wallet = new Wallet();

/**
 * Key under which the round in progress is saved in localStorage.
 * @type {string}
 */
const GAME_STORAGE_KEY = 'blackjack25.game';

/**
 * Delay between cards dealt in the same update, in milliseconds.
 * @type {number}
 */
const DEAL_STEP_MS = 300;

/**
 * Duration of the flip of the dealer's hidden card, in milliseconds.
 * @type {number}
 */
const FLIP_MS = 600;

/**
 * Pause after each card drawn by the dealer, in milliseconds.
 * @type {number}
 */
const DEALER_STEP_MS = 800;

/**
 * Waits for the given time.
 * @param {number} ms - The time to wait in milliseconds.
 * @returns {Promise<void>} - A promise resolved after the wait.
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fills the values shown in the page text (elements with a data-const attribute)
 * from the game constants, so the rules never get out of sync with the code.
 * @returns {void}
 */
function renderConstants() {
    const values = {
        maxPoints: Blackjack.MAX_POINTS,
        dealerPoints: Blackjack.DEALER_MAX_TURN_POINTS,
        startChips: Wallet.START_CHIPS,
        minBet: Wallet.MIN_BET
    };

    document.querySelectorAll('[data-const]').forEach(element => {
        element.textContent = values[element.dataset.const];
    });
}

/**
 * Connects the buttons of the page to the controller functions.
 * The bet buttons carry their step in data-bet-step (-1, 1 or 'max') and use Wallet.BET_STEP.
 * @returns {void}
 */
function setupEvents() {
    document.getElementById('card').addEventListener('click', playerNewCard);
    document.getElementById('stand').addEventListener('click', dealerFinish);
    document.getElementById('new_game').addEventListener('click', prepareBetting);
    document.getElementById('deal').addEventListener('click', newGame);

    document.querySelectorAll('[data-bet-step]').forEach(button => {
        button.addEventListener('click', () => {
            const step = button.dataset.betStep;
            changeBet(step === 'max' ? 'max' : Number(step) * Wallet.BET_STEP);
        });
    });
}

/**
 * Initializes the page: fills the rule values, connects the buttons and shows the saved state.
 * If a round was in progress (or just finished) when the page was closed, it is restored as it was;
 * otherwise it shows the betting phase.
 * @returns {void}
 */
function initPage() {
    renderConstants();
    setupEvents();
    if (!restoreRound()) {
        prepareBetting();
    }
}

/**
 * Initializes the game buttons for the player's turn:
 * enables "draw" and "stand", disables "new round".
 * @returns {void}
 */
function buttonsInitialization() {
    document.getElementById('card').disabled = false; // Enables the button to draw a card
    document.getElementById('stand').disabled = false; // Enables the button to stand
    document.getElementById('new_game').disabled = true; // Disables the button for a new game
}

/**
 * Disables the player's buttons while the dealer plays his turn.
 * @returns {void}
 */
function lockPlayerButtons() {
    document.getElementById('card').disabled = true;
    document.getElementById('stand').disabled = true;
}

/**
 * Finalizes the buttons after the game ends:
 * disables "draw" and "stand", enables "new round".
 * @returns {void}
 */
function finalizeButtons() {
    document.getElementById('card').disabled = true; // Disables the button to draw a card
    document.getElementById('stand').disabled = true; // Disables the button to stand
    document.getElementById('new_game').disabled = false; // Enables the button for a new game
}

/**
 * Sets the result tag (won / lost / busted / draw) next to a hand's title.
 * @param {string} id - The id of the tag element.
 * @param {string} text - The text to show (empty hides the tag).
 * @param {string} [className=''] - The CSS class that colors the tag.
 * @returns {void}
 */
function setResultTag(id, text, className = '') {
    const tag = document.getElementById(id);
    tag.textContent = text;
    tag.className = `result-tag ${className}`.trim();
}

/**
 * Clears the table (cards, scores, result tags and status message) to start a new game.
 * @returns {void}
 */
function clearPage() {
    document.getElementById('dealer').replaceChildren();
    document.getElementById('player').replaceChildren();
    document.getElementById('dealer-score').textContent = '-';
    document.getElementById('player-score').textContent = '-';
    setResultTag('dealer-result', '');
    setResultTag('player-result', '');

    const status = document.getElementById('game_status');
    status.textContent = 'A preparar a mesa ...';
    status.className = 'game-status';
}

/**
 * Shows the chips owned in the player's header.
 * @returns {void}
 */
function renderChips() {
    document.getElementById('chips').textContent = wallet.chips;

}

/**
 * Applies the active theme to the page: styles (via data-theme), icons, tagline
 * and the color of the browser bar on mobile.
 * @returns {void}
 */
function applyTheme() {
    const theme = THEMES.find(t => t.id === wallet.theme) || THEMES[0];
    document.documentElement.dataset.theme = theme.id;
    document.querySelector('.brand-mark i').className = `bi ${theme.brandIcon}`;
    document.querySelector('.table-divider i').className = `bi ${theme.dividerIcon}`;
    document.querySelector('.header-note').textContent = theme.tagline;

    // Color of the browser bar on mobile
    const color = getComputedStyle(document.documentElement).getPropertyValue('--felt-deep').trim();
    document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
}

/**
 * Shows the current bet in the betting panel.
 * @returns {void}
 */
function renderBet() {
    document.getElementById('bet-amount').textContent = wallet.bet;
}

/**
 * Asks the wallet to change the bet (in steps, or to the maximum with 'max') and shows the result.
 * @param {number|string} change - Amount to add (can be negative) or 'max'.
 * @returns {void}
 */
function changeBet(change) {
    wallet.changeBet(change);
    renderBet();
}

/**
 * Buttons during the betting phase: only the bet panel is usable.
 * @returns {void}
 */
function bettingButtons() {
    document.getElementById('card').disabled = true;
    document.getElementById('stand').disabled = true;
    document.getElementById('new_game').disabled = true;
}

/**
 * Shows the betting phase (before the first game and when "new round" is chosen):
 * clears the table and the saved game, rescues a broke player and shows the betting panel.
 * The game itself is created and dealt by newGame(), when the player chooses "deal".
 * @returns {void}
 */
function prepareBetting() {
    game = null;
    dealerPlaying = false;
    try {
        localStorage.removeItem(GAME_STORAGE_KEY); // A reload now goes back to the betting phase
    } catch (e) { /* ignored */ }
    clearPage();
    applyTheme();

    const rescued = wallet.rescueIfBroke();
    changeBet(0); // Adjusts the previous bet to what can still be wagered
    renderChips();
    renderShop();

    bettingButtons();
    document.getElementById('bet-panel').hidden = false;

    const status = document.getElementById('game_status');
    status.textContent = rescued
        ? `Ficaste sem fichas! Recebes ${Wallet.START_CHIPS} para continuar. Faz a tua aposta.`
        : 'Faz a tua aposta.';
}

/**
 * Asks the wallet to settle the bet (it only counts once per round) and refreshes the chips and the shop.
 * @param {GameState} state - The current state of the game.
 * @returns {number} - Chips won (+) or lost (-) in the round.
 */
function settleBet(state) {
    const net = wallet.settle(state);
    renderChips();
    renderShop();
    return net;
}

/**
 * Formats the chips won or lost in a round.
 * @param {number} net - Chips won (+) or lost (-).
 * @returns {string} - Text with the chips won or lost, e.g. "(+10 fichas)".
 */
function formatNet(net) {
    if (net > 0) return `(+${net} fichas)`;
    if (net < 0) return `(${net} fichas)`;
    return '(aposta devolvida)';
}

/**
 * Activates an unlocked theme and refreshes the page and the shop.
 * @param {string} id - The theme id.
 * @returns {void}
 */
function selectTheme(id) {
    if (wallet.select(id)) {
        applyTheme();
        renderShop();
    }
}

/**
 * Buys (unlocks) a theme, activates it and refreshes the page, the chips and the shop.
 * @param {string} id - The theme id.
 * @returns {void}
 */
function buyTheme(id) {
    if (wallet.buy(id)) {
        applyTheme();
        renderChips();
        renderShop();
    }
}

/**
 * Builds the list of themes in the shop, with a buy / use button for each one.
 * @returns {void}
 */
function renderShop() {
    document.getElementById('shop-chips').textContent = wallet.chips;
    const list = document.getElementById('shop-list');
    list.replaceChildren();

    THEMES.forEach(theme => {
        const owned = wallet.owns(theme.id);
        const active = wallet.theme === theme.id;
        const price = wallet.themeCost(theme.id);

        const item = document.createElement('div');
        item.className = 'shop-item' + (active ? ' is-active' : '');

        const swatch = document.createElement('span');
        swatch.className = 'shop-swatch';
        swatch.style.background = `linear-gradient(145deg, ${theme.swatch[0]}, ${theme.swatch[1]})`;
        swatch.style.color = theme.accent;
        const icon = document.createElement('i');
        icon.className = `bi ${theme.brandIcon}`;
        swatch.appendChild(icon);

        const info = document.createElement('div');
        const name = document.createElement('div');
        name.className = 'shop-name';
        name.style.fontFamily = theme.font; // Shows the theme's own typography
        name.textContent = theme.name;
        const desc = document.createElement('div');
        desc.className = 'shop-desc';
        desc.textContent = theme.desc;
        const cost = document.createElement('div');
        cost.className = 'shop-cost';
        cost.textContent = owned ? 'Desbloqueado' : `${price} fichas`;
        info.append(name, desc, cost);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn button ' + (owned ? 'button-secondary' : 'button-primary');
        button.textContent = active ? 'Em uso' : owned ? 'Usar' : 'Comprar';
        button.disabled = active || (!owned && wallet.chips < price);
        button.addEventListener('click', () => (owned ? selectTheme(theme.id) : buyTheme(theme.id)));

        item.append(swatch, info, button);
        list.appendChild(item);
    });
}

/**
 * Saves the current game in localStorage, so a round survives a page reload.
 * Failures (e.g. localStorage unavailable) are ignored.
 * @returns {void}
 */
function saveGame() {
    try {
        localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game.serialize()));
    } catch (e) { /* ignored */ }
}

/**
 * Reads the saved game from localStorage.
 * @returns {Blackjack|null} - The restored game, or null if there is none or the data is not valid.
 */
function loadSavedGame() {
    try {
        return Blackjack.restore(JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)));
    } catch (e) {
        return null;
    }
}

/**
 * Puts back on the table the game that was saved before the page was closed:
 * the cards, the scores, the hidden card (if the dealer had not started playing),
 * the status message and the buttons. If the dealer was in the middle of his turn,
 * he carries on playing. A finished game is shown with its result.
 * @returns {boolean} - True if a game was restored (false if there was none, or it does not match the wallet).
 */
function restoreRound() {
    const restored = loadSavedGame();
    if (!restored) {
        return false;
    }

    const state = restored.getGameState();
    if (!state.gameEnded && wallet.roundSettled) {
        return false; // A round in progress must have a bet that was taken: the saved data do not match
    }

    game = restored;
    dealerPlaying = false;
    clearPage();
    applyTheme();
    renderChips();
    renderShop();
    renderBet();
    document.getElementById('bet-panel').hidden = true;

    updatePlayer(state);
    updateDealer(state);
    updateStatus(state); // If the game had ended, it shows the result and enables "new round"

    if (!state.gameEnded) {
        buttonsInitialization();
        if (game.isDealerTurn()) {
            dealerFinish(); // The dealer carries on from where he stopped
        }
    }
    return true;
}

/**
 * Starts a new game: takes the bet, creates a new game, clears the table,
 * hides the betting panel and deals the initial cards (two for the player and two for the dealer).
 * The dealer's 2nd card is printed face down, and only his 1st card counts for his score.
 * The game is saved right away, so it is still there after reloading the page.
 * Does nothing while a game is still being played or if the bet is not valid.
 * @returns {void}
 */
function newGame() {
    if (game && !game.getGameState().gameEnded) {
        return; // The current game has not ended yet
    }

    if (!wallet.placeBet()) {
        return;
    }

    game = new Blackjack(); // Creates a new instance of the Blackjack game
    dealerPlaying = false;
    clearPage();
    renderChips();

    document.getElementById('bet-panel').hidden = true;
    buttonsInitialization();

    const state = game.dealInitialCards();
    updatePlayer(state);
    updateDealer(state, DEAL_STEP_MS / 2); // Prints the 2nd card of the dealer face down
    updateStatus(state);
    saveGame();
}

/**
 * Updates the status message in every turn (player's turn, dealer's turn and end of game).
 * When the game has ended it also settles the bet, appends the chips won or lost
 * and finalizes the buttons (the only place where this happens).
 * The cards and result tags are drawn by updatePlayer() and updateDealer().
 * @param {GameState} state - The current state of the game.
 * @returns {void}
 */
function updateStatus(state) {
    const status = document.getElementById('game_status');
    const playerValue = game.getCardsValue(game.getPlayerCards());
    const dealerValue = game.getCardsValue(game.getDealerCards());

    if (state.gameEnded){
        finalizeButtons();
        const net = settleBet(state);

        if (state.playerBusted){
            status.textContent = `Ultrapassaste os ${Blackjack.MAX_POINTS} pontos. O dealer venceu!`;
            status.className = 'game-status result-loss';
        } else if (state.dealerBusted){
            status.textContent = `O dealer ultrapassou os ${Blackjack.MAX_POINTS} pontos. Ganhaste!`;
            status.className = 'game-status result-win';
        } else if (state.playerWon){
            status.textContent = playerValue === Blackjack.MAX_POINTS
                ? `Fizeste ${Blackjack.MAX_POINTS} pontos. Ganhaste!`
                : `Ganhaste esta ronda por ${playerValue} contra ${dealerValue}!`;
            status.className = 'game-status result-win';
        } else if (state.dealerWon){
            status.textContent = `O dealer ganhou esta ronda por ${dealerValue} contra ${playerValue}.`;
            status.className = 'game-status result-loss';
        } else {
            status.textContent = `Empate! Ambos ficaram com ${playerValue} pontos.`;
            status.className = 'game-status result-draw';
        }
        status.textContent += ` ${formatNet(net)}`;
        return;
    }

    status.textContent = game.isDealerTurn()
        ? `É a vez do dealer - tens ${playerValue} pontos e o dealer tem ${dealerValue} pontos.`
        : `É a tua vez - tens ${playerValue} pontos.`
    status.className = 'game-status';
}

/**
 * Updates the dealer's side of the interface: prints the new cards, flips the hidden card
 * when the dealer's turn starts or the game ends, and updates the score and the result tag.
 * Only the first card counts for the score while the second one is still hidden.
 * @param {GameState} state - The current state of the game.
 * @param {number} [delayOffset=0] - Extra delay, in milliseconds, added to the animation of the new cards.
 * @returns {void}
 */
function updateDealer(state, delayOffset = 0) {
    const dealerElement = document.getElementById('dealer');
    const cards = game.getDealerCards();
    const revealAll = game.isDealerTurn() || state.gameEnded;
    const shown = dealerElement.children.length;

    for(let index = shown; index < cards.length; index++){
        const delay = delayOffset + (index - shown) * DEAL_STEP_MS;
        printCard(dealerElement, cards[index], index === 1 && !revealAll, delay);
    }

    if (revealAll) {
        const hiddenCard = dealerElement.querySelector('.card-flip:not(.is-flipped)');
        if (hiddenCard) {
            flipCard(hiddenCard);
        }
    }

    const visibleCards = revealAll ? cards : cards.slice(0, 1);
    document.getElementById('dealer-score').textContent = String(game.getCardsValue(visibleCards));

    if (state.gameEnded) {
        if (state.dealerWon) {
            setResultTag('dealer-result', 'Ganhou', 'result-win');
        } else if (state.dealerBusted) {
            setResultTag('dealer-result', 'Rebentou', 'result-loss');
        } else if (state.playerWon) {
            setResultTag('dealer-result', 'Perdeu', 'result-loss');
        } else {
            setResultTag('dealer-result', 'Empate', 'result-draw');
        }
    } else {
        setResultTag('dealer-result', '');
    }
}

/**
 * Updates the player's side of the interface: prints the new cards, updates the score
 * and shows the result tag when the game has ended (and the dealer is not still playing).
 * @param {GameState} state - The current state of the game.
 * @returns {void}
 */
function updatePlayer(state) {
    const playerElement = document.getElementById('player');
    const cards = game.getPlayerCards();
    const shown = playerElement.children.length; // Cards already on the table

    for (let index = shown; index < cards.length; index++) {
        printCard(playerElement, cards[index], false, (index - shown) * DEAL_STEP_MS);
    }

    document.getElementById('player-score').textContent = String(game.getCardsValue(cards));

    if (state.gameEnded && !dealerPlaying) {
        if (state.playerWon) {
            setResultTag('player-result', 'Ganhaste', 'result-win');
        } else if (state.playerBusted) {
            setResultTag('player-result', 'Rebentaste', 'result-loss');
        } else if (state.dealerWon) {
            setResultTag('player-result', 'Perdeste', 'result-loss');
        } else {
            setResultTag('player-result', 'Empate', 'result-draw');
        }
    } else {
        setResultTag('player-result', '');
    }
}

/**
 * Causes the dealer to draw a new card, updates the interface and saves the game.
 * @returns {GameState} - The game state after the dealer's move.
 */
function dealerNewCard() {
    const state = game.dealerMove();
    updateDealer(state);
    updateStatus(state);
    saveGame();
    return state;
}

/**
 * Causes the player to draw a new card, updates the interface and saves the game.
 * @returns {GameState} - The game state after the player's move.
 */
function playerNewCard() {
    const state = game.playerMove();
    updatePlayer(state);
    if (state.gameEnded) {
        updateDealer(state); // Reveals the dealer's hidden card and shows his result
    }
    updateStatus(state);
    saveGame();
    return state;
}

/**
 * Finishes the game on the dealer's turn: locks the player's buttons, reveals the hidden card
 * and makes the dealer draw one card at a time until the game ends.
 * Stops silently if a new game starts in the meantime.
 * @returns {Promise<void>} - A promise resolved when the dealer's turn is over.
 */
async function dealerFinish() {
    if (!game || dealerPlaying || game.getGameState().gameEnded) {
        return;
    }

    const currentGame = game; // Used to stop if a new game starts in the meantime
    dealerPlaying = true;
    lockPlayerButtons();

    game.setDealerTurn(true); // From now on the dealer plays
    saveGame(); // From now on a reload goes back to the dealer's turn
    let state = game.getGameState();
    updateDealer(state); // Flips the hidden card
    updateStatus(state);
    await wait(FLIP_MS + 300);

    // The dealer keeps drawing, one card at a time, until the game ends
    while (!state.gameEnded) {
        if (game !== currentGame) {
            return;
        }
        state = dealerNewCard();
        await wait(DEALER_STEP_MS);
    }

    if (game !== currentGame) {
        return;
    }

    // All the cards are on the table: now the player's result tag can be shown
    dealerPlaying = false;
    updatePlayer(state);
}

/**
 * Prints a card in the graphical interface.
 * A hidden card is created face down, with the real face behind it, so it can be flipped later with flipCard().
 * @param {HTMLElement} element - The element where the card will be displayed.
 * @param {Card} card - The card to be displayed.
 * @param {boolean} [hidden=false] - True to show the card face down.
 * @param {number} [delay=0] - Delay of the deal animation, in milliseconds.
 * @returns {void}
 */
function printCard(element, card, hidden = false, delay = 0) {
    const cardName = `${card.rank} of ${card.suit}`;
    let cardElement;

    if (hidden) {
        cardElement = document.createElement('div');
        cardElement.className = 'playing-card card-flip';
        cardElement.setAttribute('role', 'img');
        cardElement.setAttribute('aria-label', 'Carta virada para baixo');
        cardElement.dataset.label = cardName; // Used as the description after the flip

        const inner = document.createElement('div');
        inner.className = 'card-inner';

        const back = document.createElement('img');
        back.className = 'card-face card-back';
        back.alt = '';
        back.src = Card.BACK_IMAGE;
        back.draggable = false;

        const front = document.createElement('img');
        front.className = 'card-face card-front';
        front.alt = '';
        front.src = card.image;
        front.draggable = false;

        inner.appendChild(back);
        inner.appendChild(front);
        cardElement.appendChild(inner);
    } else {
        cardElement = document.createElement('img');
        cardElement.className = 'playing-card';
        cardElement.alt = cardName;
        cardElement.src = card.image;
        cardElement.draggable = false;
    }

    cardElement.style.animationDelay = `${delay}ms`;
    element.appendChild(cardElement);
}

/**
 * Flips a face-down card so its face is shown, and updates its accessible label.
 * @param {HTMLElement} cardElement - The card created by printCard with hidden = true.
 * @returns {void}
 */
function flipCard(cardElement) {
    cardElement.classList.add('is-flipped');
    cardElement.setAttribute('aria-label', cardElement.dataset.label);
}

window.addEventListener('DOMContentLoaded', initPage);