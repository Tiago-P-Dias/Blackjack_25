// Blackjack object

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
        this.rank = rank;
        this.suit = suit;
        this.value = Card.valueOf(rank);
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
 * Class that represents the Blackjack game.
 */
class Blackjack {
    // Constant that defines the maximum points to avoid busting in Blackjack
    static MAX_POINTS = 25;
    // Constant that defines the point threshold at which the dealer must stand
    static DEALER_MAX_TURN_POINTS = 21;

    /**
     * Creates an instance of Blackjack and initializes the deck.
     */
    constructor() {
        this.dealerCards = []; // Array to hold the dealer's cards
        this.playerCards = []; // Array to hold the player's cards
        this.dealerTurn = false; // Flag to indicate if it's the dealer's turn to play

        // State of the game with information about the outcome
        this.state = {
            gameEnded: false, // Indicates whether the game has ended
            playerWon: false, // Indicates if the player has won
            dealerWon: false, // Indicates if the dealer has won
            playerBusted: false, // Indicates if the player has exceeded MAX_POINTS
            dealerBusted: false // Indicates if the dealer has exceeded MAX_POINTS
        };

        // Initialize the deck of cards
        this.deck = this.shuffle(this.newDeck()); // Create and shuffle a new deck
    }

    /**
     * Creates a new deck of cards.
     * @returns {Card[]} - An array of cards.
     */
    newDeck() {
        const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

        return suits.flatMap(suit => ranks.map(rank => new Card(rank, suit)));
    }

    /**
     * Shuffles the deck of cards.
     * @param {Card[]} deck - The deck of cards to be shuffled.
     * @returns {Card[]} - The shuffled deck.
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
     * @returns {Card[]} - An array containing the dealer's cards.
     */
    getDealerCards() {
        return this.dealerCards.slice(); // Return a copy of the dealer's cards
    }

    /**
     * Returns the player's cards.
     * @returns {Card[]} - An array containing the player's cards.
     */
    getPlayerCards() {
        return this.playerCards.slice(); // Return a copy of the player's cards
    }

    /**
     * Sets whether it is the dealer's turn to play.
     * @param {boolean} val - Value indicating if it's the dealer's turn.
     */
    setDealerTurn(val) {
        this.dealerTurn = val; // Update the dealer's turn status
    }

    /**
     * Calculates the total value of the provided cards.
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
     * @returns {Object} - The game state after dealing.
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
     * @returns {Object} - The game state after the dealer's move.
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
     * @returns {Object} - The game state after the player's move.
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
     *    the player's score (he wins with more points, or the game is a draw if equal).
     * @returns {Object} - The updated game state.
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
}
