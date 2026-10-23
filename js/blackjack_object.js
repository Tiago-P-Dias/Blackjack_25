
/**
 * Class that represents a single playing card.
 */
class Card {
    /**
     * Creates a card.
     * @param {string} rank - 'ace', '2' to '10', 'jack', 'queen' or 'king'.
     * @param {string} suit - 'clubs', 'diamonds', 'hearts' or 'spades'.
     */
    constructor(rank, suit) {
        /** @type {string} Rank of the card. */
        this.rank = rank;
        /** @type {string} Suit of the card. */
        this.suit = suit;
        /** @type {number} Base value of the card (the ace counts as 11). */
        this.value = Card.valueOf(rank);
        /** @type {string} Path of the SVG image of the card face. */
        this.image = Card.imagePath(rank, suit);
    }

    /**
     * Returns the base value of a rank (the ace counts as 11 here).
     * @param {string} rank - The rank of the card.
     * @returns {number} - The base value of the card.
     */
    static valueOf(rank) {
        if (rank === 'ace') {
            return 11;
        }
        if (['jack', 'queen', 'king'].includes(rank)) {
            return 10;
        }
        return Number(rank);
    }

    /**
     * Path of the SVG image of the back of a card (face-down cards).
     * @type {string}
     */
    static BACK_IMAGE = 'img/svg/card_back.svg';

    /**
     * Returns the path of the SVG image of a card.
     * @param {string} rank - The rank of the card.
     * @param {string} suit - The suit of the card.
     * @returns {string} - The image path.
     */
    static imagePath(rank, suit) {
        const baseName = `${rank}_of_${suit}`;
        const imageName = `${baseName}.svg`;
        return `img/svg/${imageName}`;
    }

    /**
     * Indicates whether the card is an ace.
     * @returns {boolean} - True if the card is an ace.
     */
    isAce() {
        return this.rank === 'ace';
    }
}

/**
 * Class that represents the Blackjack game (the Model of the MVC).
 */
class Blackjack {
    /**
     * Maximum points before busting.
     * @type {number}
     */
    static MAX_POINTS = 25;
    /**
     * Points at which the dealer must stand during his turn.
     * @type {number}
     */
    static DEALER_MAX_TURN_POINTS = 21;
    /**
     * The four suits of a deck.
     * @type {string[]}
     */
    static SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
    /**
     * The thirteen ranks of each suit.
     * @type {string[]}
     */
    static RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

    /**
     * Creates an instance of Blackjack and initializes the deck.
     */
    constructor() {
        /** @type {Card[]} Cards in the dealer's hand. */
        this.dealerCards = [];
        /** @type {Card[]} Cards in the player's hand. */
        this.playerCards = [];
        /** @type {boolean} True when it is the dealer's turn to play. */
        this.dealerTurn = false;

        /** @type {GameState} State of the game with information about the outcome. */
        this.state = {
            gameEnded: false, // Indicates whether the game has ended
            playerWon: false, // Indicates if the player has won
            dealerWon: false, // Indicates if the dealer has won
            playerBusted: false, // Indicates if the player has exceeded MAX_POINTS
            dealerBusted: false // Indicates if the dealer has exceeded MAX_POINTS
        };

        /** @type {Card[]} Shuffled deck; cards are drawn from the end with pop(). */
        this.deck = this.shuffle(this.newDeck()); // Create and shuffle a new deck
    }

    /**
     * Creates a new, ordered deck of 52 cards (4 suits x 13 ranks).
     * @returns {Card[]} - An array of 52 cards.
     */
    newDeck() {
        return Blackjack.SUITS.flatMap(suit => Blackjack.RANKS.map(rank => new Card(rank, suit)));
    }

    /**
     * Shuffles a deck using the Fisher-Yates algorithm. The original array is not modified.
     * @param {Card[]} deck - The deck of cards to be shuffled.
     * @returns {Card[]} - A new, shuffled deck.
     */
    shuffle(deck) {
        const shuffledDeck = deck.slice(); //cria copia do baralho

        for (let index = shuffledDeck.length - 1; index > 0 ; index--){ //percorre o baralho de trás para a frente
            const swapIndex = Math.floor(Math.random() * (index + 1)); // escolhe uma posição aleatoria entre 0 e index
            [shuffledDeck[index], shuffledDeck[swapIndex]] = [shuffledDeck[swapIndex], shuffledDeck[index]];  // troca a posição index pela carta da posição aleatoria
        }

        return shuffledDeck;
    }

    /**
     * Returns the dealer's cards.
     * @returns {Card[]} - A copy of the array with the dealer's cards.
     */
    getDealerCards() {
        return this.dealerCards.slice(); // Return a copy of the dealer's cards
    }

    /**
     * Returns the player's cards.
     * @returns {Card[]} - A copy of the array with the player's cards.
     */
    getPlayerCards() {
        return this.playerCards.slice(); // Return a copy of the player's cards
    }

    /**
     * Sets whether it is the dealer's turn to play.
     * @param {boolean} val - True if it is the dealer's turn.
     * @returns {void}
     */
    setDealerTurn(val) {
        this.dealerTurn = val; // Update the dealer's turn status
    }

    /**
     * Indicates whether it is the dealer's turn to play.
     * @returns {boolean} - True if it is the dealer's turn.
     */
    isDealerTurn() {
        return this.dealerTurn;
    }

    /**
     * Calculates the total value of the provided cards.
     * Aces count as 11 and drop to 1 (one at a time) while the total exceeds MAX_POINTS.
     * Face cards (jack, queen, king) count as 10.
     * @param {Card[]} cards - Array of cards to be evaluated.
     * @returns {number} - The total value of the cards.
     */
    getCardsValue(cards) {
        let total = cards.reduce((sum, card) => sum + card.value, 0);  // o total começa em 0 soma o valor da carta e os Áses valem 11
        let aces = cards.filter(card => card.isAce()).length; // vê quantos Áses há na mão

        while(total > Blackjack.MAX_POINTS && aces > 0){ // se o total for maior que a pontuação e houverem ases, eles passam a valer 1
            total -= 10;
            aces--;
        }

        return total;
    }

    /**
     * Deals the initial cards: two for the player and two for the dealer.
     * @returns {GameState} - The game state after dealing.
     */
    dealInitialCards() {
        for (let i = 0; i < 2; i++) {
            this.playerCards.push(this.deck.pop());
            this.dealerCards.push(this.deck.pop());
        }

        return this.getGameState();
    }

    /**
     * Executes the dealer's move by adding a card to the dealer's array.
     * Does nothing if the game has ended, it is not the dealer's turn or the deck is empty.
     * @returns {GameState} - The game state after the dealer's move.
     */
    dealerMove() {
        // se o jogo acabou, não for a vez do dealer ou o deck acabar, retorna o estado do jogo
        if (this.state.gameEnded || !this.dealerTurn || this.deck.length === 0){
            return this.getGameState();
        }

        this.dealerCards.push(this.deck.pop()); // tira a ultima carta do deck
        return this.getGameState();
    }

    /**
     * Executes the player's move by adding a card to the player's array.
     * Does nothing if the game has ended, it is the dealer's turn or the deck is empty.
     * @returns {GameState} - The game state after the player's move.
     */
    playerMove() {
        // se o jogo acabou, for a vez do dealer ou o deck acabar, retorna o estado do jogo
        if (this.state.gameEnded || this.dealerTurn || this.deck.length === 0){
            return this.getGameState();
        }

        this.playerCards.push(this.deck.pop()); // tira a ultima carta do deck
        return this.getGameState();
    }

    /**
     * Checks the game state based on the dealer's and player's cards.
     *
     * The game ends when:
     *  - the player busts (loses);
     *  - the player reaches MAX_POINTS (wins);
     *  - the dealer busts (loses);
     *  - it is the dealer's turn and he reaches DEALER_MAX_TURN_POINTS or at least
     *    the player's score (he wins with more points, or the game is a draw if equal);
     *  - the deck is empty.
     * @returns {GameState} - A copy of the updated game state.
     */
    getGameState() {
        const playerValue = this.getCardsValue(this.playerCards);
        const dealerValue = this.getCardsValue(this.dealerCards);
        const playerBusted = playerValue > Blackjack.MAX_POINTS;
        const dealerBusted = dealerValue > Blackjack.MAX_POINTS;
        const playerReachedMaxPoints = playerValue === Blackjack.MAX_POINTS;
        const dealerFinish = this.dealerTurn && (dealerValue >= Blackjack.DEALER_MAX_TURN_POINTS || dealerValue >= playerValue);
        const gameEnded = playerBusted || dealerBusted || playerReachedMaxPoints || dealerFinish || this.deck.length === 0;

        this.state = {
            gameEnded,
            playerWon: gameEnded && !playerBusted && (dealerBusted || playerValue > dealerValue),
            dealerWon: gameEnded && !dealerBusted && (playerBusted || dealerValue > playerValue),
            playerBusted,
            dealerBusted
        };

        return {...this.state}; // retorna uma copia do estado de jogo
    }

    /**
     * Converts the game into plain data (no class instances), so it can be stored as JSON.
     * @returns {BlackjackSave} - The deck, both hands and whose turn it is.
     */
    serialize() {
        const toPlain = cards => cards.map(card => ({ rank: card.rank, suit: card.suit }));

        return {
            deck: toPlain(this.deck),
            dealerCards: toPlain(this.dealerCards),
            playerCards: toPlain(this.playerCards),
            dealerTurn: this.dealerTurn
        };
    }

    /**
     * Checks whether saved data describes a real game that was already dealt:
     * 52 different valid cards spread over the deck and the two hands, and at least
     * two cards in each hand.
     * @param {*} data - The data to check (e.g. read from localStorage).
     * @returns {boolean} - True if the data can be restored with Blackjack.restore().
     */
    static isValidSave(data) {
        if (!data || !Array.isArray(data.deck) || !Array.isArray(data.dealerCards) || !Array.isArray(data.playerCards)) {
            return false;
        }
        if (data.dealerCards.length < 2 || data.playerCards.length < 2) {
            return false;
        }

        const all = [...data.deck, ...data.dealerCards, ...data.playerCards];
        if (all.length !== Blackjack.SUITS.length * Blackjack.RANKS.length) {
            return false;
        }

        const seen = new Set();
        for (const card of all) {
            if (!card || !Blackjack.SUITS.includes(card.suit) || !Blackjack.RANKS.includes(card.rank)) {
                return false;
            }
            seen.add(`${card.rank}_${card.suit}`);
        }

        return seen.size === all.length; // No repeated cards
    }

    /**
     * Rebuilds a game from the data created by serialize().
     * @param {BlackjackSave} data - The saved game.
     * @returns {Blackjack|null} - The restored game, or null if the data is not valid.
     */
    static restore(data) {
        if (!Blackjack.isValidSave(data)) {
            return null;
        }

        const toCards = list => list.map(card => new Card(card.rank, card.suit));
        const restored = new Blackjack();
        restored.deck = toCards(data.deck);
        restored.dealerCards = toCards(data.dealerCards);
        restored.playerCards = toCards(data.playerCards);
        restored.dealerTurn = data.dealerTurn === true;
        restored.getGameState(); // Recalculates the state from the cards

        return restored;
    }
}