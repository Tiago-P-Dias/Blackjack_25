// Blackjack OOP

let game = null; // Stores the current instance of the game
let dealerPlaying = false; // true while the dealer plays his turn step by step

const wallet = new Wallet(); // Chips, unlocked themes and active theme
let currentBet = Wallet.MIN_BET; // Bet chosen for the current round
let roundSettled = false; // Guarantees the bet is settled only once per round
let roundNet = 0; // Chips won (+) or lost (-) in the current round

const DEAL_STEP_MS = 300; //Delay between cards delat in the same update 
const FLIP_MS = 600; // Duration of the flip of the dealer's hidden card
const DEALER_STEP_MS = 800; //Pause after each carrd drawn by the dealer

/**
 * Waits for the given time.
 * @param {number} ms - The time to wait in milliseconds.
 * @returns {Promise<void>} - A promise resolved after the wait.
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initializes the game buttons.
 */
function buttonsInitialization() {
    document.getElementById('card').disabled = false; // Enables the button to draw a card
    document.getElementById('stand').disabled = false; // Enables the button to stand
    document.getElementById('new_game').disabled = true; // Disables the button for a new game
}

/**
 * Disables the player's buttons while the dealer plays his turn.
 */
function lockPlayerButtons() {
    document.getElementById('card').disabled = true;
    document.getElementById('stand').disabled = true;
}

/**
 * Finalizes the buttons after the game ends.
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
 */
function setResultTag(id, text, className = '') {
    const tag = document.getElementById(id);
    tag.textContent = text;
    tag.className = `result-tag ${className}`.trim();
}

/**
 * Clears the page to start a new game.
 */
function clearPage() {
    document.getElementById('dealer').replaceChildren();
    document.getElementById('player').replaceChildren();
    document.getElementById('dealer-score').textContent = '-';
    document.getElementById('player-score').textContent = '-';
    setResultTag('dealer-result', '');
    setResultTag('player-result', '');

    const status = document.getElementById('game_status');
    status.textContent = 'A preparar mesa ...';
    status.className = 'game-status';
}

/**
 * Shows the chips in the header and in the shop.
 */
function renderChips() {
    document.getElementById('chips').textContent = wallet.chips;
    document.getElementById('shop-chips').textContent = wallet.chips;
}

/**
 * Applies the active theme to the page: styles (via data-theme), icons and tagline.
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
 * Shows the current bet.
 */
function renderBet() {
    document.getElementById('bet-amount').textContent = currentBet;
}

/**
 * Changes the bet in steps, or sets the maximum with 'max'.
 * @param {number|string} change - Amount to add (can be negative) or 'max'.
 */
function changeBet(change) {
    const maxBet = Math.max(Wallet.MIN_BET, Math.floor(wallet.chips / Wallet.BET_STEP) * Wallet.BET_STEP);
    const wanted = change === 'max' ? wallet.chips : currentBet + change;
    const rounded = Math.floor(wanted / Wallet.BET_STEP) * Wallet.BET_STEP;
    currentBet = Math.min(Math.max(rounded, Wallet.MIN_BET), maxBet);
    renderBet();
}

/**
 * Buttons during the betting phase: only the bet panel is usable.
 */
function bettingButtons() {
    document.getElementById('card').disabled = true;
    document.getElementById('stand').disabled = true;
    document.getElementById('new_game').disabled = true;
}

/**
 * Settles the bet (only once per round).
 * The bet was already taken in startRound: a win returns double, a draw returns the bet.
 * @param {Object} state - The current state of the game.
 * @returns {number} - Chips won (+) or lost (-).
 */
function settleBet(state) {
    if (roundSettled) {
        return roundNet;
    }
    roundSettled = true;

    let payout = 0;
    if (state.playerWon) {
        payout = currentBet * 2;
    } else if (!state.dealerWon) {
        payout = currentBet; // Draw
    }

    wallet.add(payout);
    roundNet = payout - currentBet;
    renderChips();
    renderShop();
    return roundNet;
}

/**
 * Formats the chips won or lost in a round.
 * @param {number} net - Chips won (+) or lost (-).
 * @returns {string}
 */
function formatNet(net) {
    if (net > 0) return `(+${net} fichas)`;
    if (net < 0) return `(${net} fichas)`;
    return '(aposta devolvida)';
}

/**
 * Activates an unlocked theme.
 * @param {string} id - The theme id.
 */
function selectTheme(id) {
    if (wallet.select(id)) {
        applyTheme();
        renderShop();
    }
}

/**
 * Buys (unlocks) a theme and activates it.
 * @param {string} id - The theme id.
 */
function buyTheme(id) {
    if (wallet.buy(id)) {
        applyTheme();
        renderChips();
        renderShop();
    }
}

/**
 * Builds the list of themes in the shop.
 */
function renderShop() {
    document.getElementById('shop-chips').textContent = wallet.chips;
    const list = document.getElementById('shop-list');
    list.replaceChildren();

    THEMES.forEach(theme => {
        const owned = wallet.owns(theme.id);
        const active = wallet.theme === theme.id;

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
        cost.textContent = owned ? 'Desbloqueado' : `${theme.cost} fichas`;
        info.append(name, desc, cost);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn button ' + (owned ? 'button-secondary' : 'button-primary');
        button.textContent = active ? 'Em uso' : owned ? 'Usar' : 'Comprar';
        button.disabled = active || (!owned && wallet.chips < theme.cost);
        button.onclick = () => (owned ? selectTheme(theme.id) : buyTheme(theme.id));

        item.append(swatch, info, button);
        list.appendChild(item);
    });
}

/**
 * Prepares a new round: shows the betting phase.
 */
function newGame() {
    game = new Blackjack(); // Creates a new instance of the Blackjack game
    dealerPlaying = false;
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
 * Takes the bet and deals the initial cards.
 */
function startRound() {
    if (!game || !wallet.placeBet(currentBet)) {
        return;
    }
    roundSettled = false;
    roundNet = 0;
    renderChips();

    document.getElementById('bet-panel').hidden = true;
    buttonsInitialization();

    game.playerCards.push(game.deck.pop(), game.deck.pop());
    game.dealerCards.push(game.deck.pop(), game.deck.pop());

    const state = game.getGameState();
    updatePlayer(state);
    updateDealer(state, DEAL_STEP_MS / 2);
    finalScore(state);
}

/**
 * Calculates and displays the final score of the game.
 * @param {Object} state - The current state of the game.
 */
function finalScore(state) {
    const status = document.getElementById('game_status');
    const playerValue = game.getCardsValue(game.getPlayerCards());
    const dealerValue = game.getCardsValue(game.getDealerCards());

    if (state.gameEnded){
        finalizeButtons();
        updateDealer(state);
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

    status.textContent = game.dealerTurn 
        ? `É a vez do dealer - tens ${playerValue} pontos e o dealer tem ${dealerValue} pontos.`
        : `É a tua vez - tens ${playerValue} pontos.`
    status.className = 'game-status';
}

/**
 * Updates the dealer's state in the game.
 * @param {Object} state - The current state of the game.
 */
function updateDealer(state, delayOffset = 0) {
    const dealerElement = document.getElementById('dealer');
    const cards = game.getDealerCards();
    const revealAll = game.dealerTurn || state.gameEnded;
    const shown = dealerElement.children.length;

    for(let index = shown; index < cards.length; index++){
        const delay = delayOffset + (index - shown) * DEAL_STEP_MS;
        printCard(dealerElement, cards[index], false, index === 1 && !revealAll, delay);
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
        finalizeButtons();
    } else {
        setResultTag('dealer-result', '');
    }
}

/**
 * Updates the player's state in the game.
 * @param {Object} state - The current state of the game.
 */
function updatePlayer(state) {
    const playerElement = document.getElementById('player');
    const cards = game.getPlayerCards();
    const shown = playerElement.children.length; // Cards already on the table
 
    for (let index = shown; index < cards.length; index++) {
        printCard(playerElement, cards[index], false, false, (index - shown) * DEAL_STEP_MS);
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
        finalizeButtons();
    } else {
        setResultTag('player-result', '');
    }
}

/**
 * Causes the dealer to draw a new card.
 * @returns {Object} - The game state after the dealer's move.
 */
function dealerNewCard() {
    const state = game.dealerMove();
    updateDealer(state);
    if (state.gameEnded) {
        updatePlayer(state); // Shows the player's result too
    }
    finalScore(state);
    return state;
}

/**
 * Causes the player to draw a new card.
 * @returns {Object} - The game state after the player's move.
 */
function playerNewCard() {
    const state = game.playerMove();
    updatePlayer(state);
    if (state.gameEnded) {
        updateDealer(state); // Reveals the dealer's hidden card and shows his result
    }
    finalScore(state);
    return state;
}

/**
 * Finishes the dealer's turn.
 */
async function dealerFinish() {
    if (!game || dealerPlaying || game.getGameState().gameEnded) {
        return;
    }
 
    const currentGame = game; // Used to stop if a new game starts in the meantime
    dealerPlaying = true;
    lockPlayerButtons();
 
    game.setDealerTurn(true); // From now on the dealer plays
    let state = game.getGameState();
    updateDealer(state); // Flips the hidden card
    finalScore(state);
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
 
    // All the cards are on the table: show the final result
    dealerPlaying = false;
    updateDealer(state);
    updatePlayer(state);
    finalScore(state);
}

/**
 * Prints the card in the graphical interface.
 * @param {HTMLElement} element - The element where the card will be displayed.
 * @param {Card} card - The card to be displayed.
 * @param {boolean} [replace=false] - Indicates whether to replace the existing image.
 */
function printCard(element, card, replace = false, hidden = false, delay = 0) {
    const cardName = `${card.rank} de ${card.suit}`;
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
        back.src = 'img/svg/card_back.svg';
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
 
    if (replace) {
        element.replaceChildren(cardElement);
    } else {
        element.appendChild(cardElement);
    }
}

/**
 * Flips a face-down card so its face is shown.
 * @param {HTMLElement} cardElement - The card created by printCard with hidden = true.
 */
function flipCard(cardElement) {
    cardElement.classList.add('is-flipped');
    cardElement.setAttribute('aria-label', cardElement.dataset.label);
}
