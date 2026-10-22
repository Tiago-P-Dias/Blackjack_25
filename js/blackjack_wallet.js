// Blackjack wallet: fichas, temas desbloqueáveis e tema ativo

/**
 * A visual theme that can be unlocked in the shop.
 * @typedef {Object} Theme
 * @property {string} id - Unique id, also used as the value of the data-theme attribute.
 * @property {string} name - Name shown in the shop.
 * @property {number} cost - Price in chips (0 = free).
 * @property {string} desc - Short description shown in the shop.
 * @property {string} font - CSS font-family used to preview the theme's typography.
 * @property {string[]} swatch - Two CSS colors that form the preview gradient.
 * @property {string} accent - CSS color of the preview icon.
 * @property {string} brandIcon - Bootstrap Icons class for the header and shop icon.
 * @property {string} dividerIcon - Bootstrap Icons class for the table divider.
 * @property {string} tagline - Text shown in the header note.
 */
 
/**
 * All the themes available in the shop. The first one is the free default.
 * @type {Theme[]}
 */
const THEMES = [
    {
        id: 'verde', name: 'Clássico', cost: 0,
        desc: 'A mesa de feltro verde tradicional.',
        font: '"Segoe UI", Arial, sans-serif',
        swatch: ['#1b5945', '#123a30'], accent: '#d7b56d',
        brandIcon: 'bi-suit-spade-fill', dividerIcon: 'bi-gem',
        tagline: 'Que a sorte esteja do teu lado'
    },
    {
        id: 'arcade', name: 'Arcade', cost: 150,
        desc: 'Pixéis, scanlines de CRT e sombras duras.',
        font: '"Press Start 2P", "Courier New", monospace',
        swatch: ['#26216a', '#0a0820'], accent: '#ffe135',
        brandIcon: 'bi-controller', dividerIcon: 'bi-joystick',
        tagline: 'Insere uma moeda e joga'
    },
    {
        id: 'oceano', name: 'Fundo do Mar', cost: 300,
        desc: 'Bolhas a subir, raios de luz e ondas na mesa.',
        font: '"Fredoka", "Segoe UI", sans-serif',
        swatch: ['#12809c', '#032a3d'], accent: '#ffcf6b',
        brandIcon: 'bi-water', dividerIcon: 'bi-droplet-fill',
        tagline: 'A sorte vem com a maré'
    },
    {
        id: 'neon', name: 'Las Vegas Neon', cost: 600,
        desc: 'Néon, grelha em movimento e letreiro a piscar.',
        font: '"Orbitron", "Segoe UI", sans-serif',
        swatch: ['#ff2bd6', '#06010e'], accent: '#5ff4ff',
        brandIcon: 'bi-lightning-charge-fill', dividerIcon: 'bi-suit-diamond-fill',
        tagline: 'As luzes nunca se apagam'
    },
    {
        id: 'espaco', name: 'Galáxia', cost: 1200,
        desc: 'Estrelas a cintilar, nebulosas e estrela cadente.',
        font: '"Exo 2", "Segoe UI", sans-serif',
        swatch: ['#2a1d63', '#05030f'], accent: '#8fd8ff',
        brandIcon: 'bi-moon-stars-fill', dividerIcon: 'bi-stars',
        tagline: 'Que a sorte seja estelar'
    }
];

/**
 * Stores the chips, the unlocked themes and the active theme.
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
     * Creates a wallet with the start chips and the default theme,
     * then loads any saved state from localStorage.
     */
    constructor() {
        /** @type {number} Chips currently owned. */
        this.chips = Wallet.START_CHIPS;
        /** @type {string[]} Ids of the unlocked themes. */
        this.unlocked = ['verde'];
        /** @type {string} Id of the active theme. */
        this.theme = 'verde';
        this.load();
    }

    /**
     * Loads the saved state from localStorage (if it exists and is valid).
     * Invalid or unavailable data is ignored and the defaults are kept.
     * @returns {void}
     */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem(Wallet.STORAGE_KEY));
            if (!data) return;
            if (Number.isInteger(data.chips) && data.chips >= 0) this.chips = data.chips;
            if (Array.isArray(data.unlocked)) {
                this.unlocked = data.unlocked.filter(id => THEMES.some(t => t.id === id));
                if (!this.unlocked.includes('verde')) this.unlocked.push('verde');
            }
            if (this.unlocked.includes(data.theme)) this.theme = data.theme;
        } catch (e) { /* localStorage indisponível ou corrompido: começa de novo */ }
    }

    /**
     * Saves the state (chips, unlocked themes and active theme) in localStorage.
     * Failures are ignored.
     * @returns {void}
     */
    save() {
        try {
            localStorage.setItem(Wallet.STORAGE_KEY, JSON.stringify({
                chips: this.chips, unlocked: this.unlocked, theme: this.theme
            }));
        } catch (e) { /* ignora */ }
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
     * Takes a bet out of the chips.
     * @param {number} amount - The bet amount.
     * @returns {boolean} - True if the bet was placed.
     */
    placeBet(amount) {
        if (!this.canBet(amount)) return false;
        this.chips -= amount;
        this.save();
        return true;
    }

    /**
     * Adds chips (prize or returned bet).
     * @param {number} amount - Chips to add.
     * @returns {void}
     */
    add(amount) {
        this.chips += amount;
        this.save();
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
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme || this.owns(themeId) || this.chips < theme.cost) return false;
        this.chips -= theme.cost;
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
