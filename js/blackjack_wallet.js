
/**
 * Stores the chips, the unlocked themes, the active theme, the chosen bet and the bet of the round in progress.
 * The state is persisted in localStorage.
 */
class Wallet {
    /**
     * Chips given at the start (and when the player goes broke).
     * @type {number}
     */
    static START_CHIPS = 100;
    /**
     * Minimum bet allowed.
     * @type {number}
     */
    static MIN_BET = 10;
    /**
     * Step used when changing the bet; bets are always multiples of it.
     * @type {number}
     */
    static BET_STEP = 10;
    /**
     * Key under which the wallet is saved in localStorage.
     * @type {string}
     */
    static STORAGE_KEY = 'blackjack25.wallet';
    /**
     * Id of the free theme that is always unlocked.
     * @type {string}
     */
    static DEFAULT_THEME = 'verde';
    /**
     * Price in chips of each theme, by theme id.
     * @type {Object<string, number>}
     */
    static THEME_COSTS = {
        verde: 0,
        arcade: 150,
        oceano: 300,
        neon: 600,
        espaco: 1200
    };

    /**
     * Creates a wallet with the start chips and the default theme,
     * then loads any saved state from localStorage.
     */
    constructor() {
        /** @type {number} Chips currently owned. */
        this.chips = Wallet.START_CHIPS;
        /** @type {string[]} Ids of the unlocked themes. */
        this.unlocked = [Wallet.DEFAULT_THEME];
        /** @type {string} Id of the active theme. */
        this.theme = Wallet.DEFAULT_THEME;
        /** @type {number} Bet chosen for the next round. */
        this.bet = Wallet.MIN_BET;
        /** @type {number} Bet taken out of the chips in the current round. */
        this.roundBet = 0;
        /** @type {boolean} True when the current round has no bet left to settle. */
        this.roundSettled = true;
        /** @type {number} Chips won (+) or lost (-) in the current round. */
        this.roundNet = 0;
        this.load();
    }

    /**
     * Loads the saved state from localStorage (if it exists and is valid).
     * Each value is checked on its own: invalid or unavailable data is ignored and the default is kept.
     * It only uses the wallet's own data (not THEMES), so it does not depend on the order of the scripts.
     * @returns {void}
     */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem(Wallet.STORAGE_KEY));
            if (!data) return;
            if (Number.isInteger(data.chips) && data.chips >= 0) this.chips = data.chips;
            if (Array.isArray(data.unlocked)) {
                this.unlocked = data.unlocked.filter(id => Wallet.isTheme(id));
                if (!this.unlocked.includes(Wallet.DEFAULT_THEME)) this.unlocked.push(Wallet.DEFAULT_THEME);
            }
            if (this.unlocked.includes(data.theme)) this.theme = data.theme;
            if (Number.isInteger(data.bet) && data.bet >= Wallet.MIN_BET) this.bet = data.bet;
            if (Number.isInteger(data.roundBet) && data.roundBet >= 0) this.roundBet = data.roundBet;
            if (typeof data.roundSettled === 'boolean') this.roundSettled = data.roundSettled;
            if (Number.isInteger(data.roundNet)) this.roundNet = data.roundNet;
        } catch (e) { /* localStorage unavailable or corrupted: start again */ }
    }

    /**
     * Saves the state (chips, unlocked themes, active theme, chosen bet and the round's bet) in localStorage.
     * Failures are ignored.
     * @returns {void}
     */
    save() {
        try {
            localStorage.setItem(Wallet.STORAGE_KEY, JSON.stringify({
                chips: this.chips,
                unlocked: this.unlocked,
                theme: this.theme,
                bet: this.bet,
                roundBet: this.roundBet,
                roundSettled: this.roundSettled,
                roundNet: this.roundNet
            }));
        } catch (e) { /* ignored */ }
    }

    /**
     * Checks whether a bet is valid.
     * @param {number} amount - The bet amount.
     * @returns {boolean} - True if the bet is an integer, at least MIN_BET and not above the chips owned.
     */
    canBet(amount) {
        return Number.isInteger(amount) && amount >= Wallet.MIN_BET && amount <= this.chips;
    }

    /**
     * Returns the highest bet the player can still wager:
     * the chips owned rounded down to a multiple of BET_STEP, and never below MIN_BET.
     * @returns {number} - The maximum bet.
     */
    maxBet() {
        return Math.max(Wallet.MIN_BET, Math.floor(this.chips / Wallet.BET_STEP) * Wallet.BET_STEP);
    }

    /**
     * Changes the bet in steps, or sets the maximum with 'max'.
     * The result is rounded to a multiple of BET_STEP and kept between MIN_BET and maxBet().
     * The chosen bet is saved, so it is still there after reloading the page.
     * @param {number|string} change - Amount to add (can be negative) or 'max'.
     * @returns {number} - The new bet.
     */
    changeBet(change) {
        const wanted = change === 'max' ? this.chips : this.bet + change;
        const rounded = Math.floor(wanted / Wallet.BET_STEP) * Wallet.BET_STEP;
        this.bet = Math.min(Math.max(rounded, Wallet.MIN_BET), this.maxBet());
        this.save();
        return this.bet;
    }

    /**
     * Takes the current bet out of the chips and opens a new round to be settled.
     * @returns {boolean} - True if the bet was placed (false if it is not valid).
     */
    placeBet() {
        if (!this.canBet(this.bet)) return false;
        this.chips -= this.bet;
        this.roundBet = this.bet;
        this.roundSettled = false;
        this.roundNet = 0;
        this.save();
        return true;
    }

    /**
     * Settles the bet of the current round (only once per round).
     * The bet was already taken in placeBet(): a win returns double, a draw returns the bet
     * and a loss returns nothing. Calling it again in the same round has no further effect.
     * @param {GameState} state - The final state of the game.
     * @returns {number} - Chips won (+) or lost (-) in the round.
     */
    settle(state) {
        if (this.roundSettled) {
            return this.roundNet;
        }
        this.roundSettled = true;

        let payout = 0;
        if (state.playerWon) {
            payout = this.roundBet * 2;
        } else if (!state.dealerWon) {
            payout = this.roundBet; // Draw
        }

        this.chips += payout;
        this.roundNet = payout - this.roundBet;
        this.save();
        return this.roundNet;
    }

    /**
     * Checks whether an id belongs to a known theme.
     * @param {string} themeId - The id to check.
     * @returns {boolean} - True if the theme exists.
     */
    static isTheme(themeId) {
        return Object.hasOwn(Wallet.THEME_COSTS, themeId);
    }

    /**
     * Returns the price of a theme.
     * @param {string} themeId - The id of the theme.
     * @returns {number|undefined} - The price in chips (undefined if the theme does not exist).
     */
    themeCost(themeId) {
        return Wallet.THEME_COSTS[themeId];
    }

    /**
     * Checks whether a theme is already unlocked.
     * @param {string} themeId - The id of the theme to check.
     * @returns {boolean} - True if the theme is unlocked.
     */
    owns(themeId) {
        return this.unlocked.includes(themeId);
    }

    /**
     * Buys (unlocks) a theme and activates it.
     * @param {string} themeId - The id of the theme to buy.
     * @returns {boolean} - True if the purchase was made (false if unknown, already owned or too expensive).
     */
    buy(themeId) {
        if (!Wallet.isTheme(themeId) || this.owns(themeId) || this.chips < this.themeCost(themeId)) return false;
        this.chips -= this.themeCost(themeId);
        this.unlocked.push(themeId);
        this.theme = themeId;
        this.save();
        return true;
    }

    /**
     * Activates an already unlocked theme.
     * @param {string} themeId - The id of the theme to activate.
     * @returns {boolean} - True if the theme was activated (false if it is not unlocked).
     */
    select(themeId) {
        if (!this.owns(themeId)) return false;
        this.theme = themeId;
        this.save();
        return true;
    }

    /**
     * If the minimum bet can no longer be placed, restarts with the start chips (keeps the themes).
     * @returns {boolean} - True if the chips were restarted.
     */
    rescueIfBroke() {
        if (this.chips >= Wallet.MIN_BET) return false;
        this.chips = Wallet.START_CHIPS;
        this.save();
        return true;
    }
}