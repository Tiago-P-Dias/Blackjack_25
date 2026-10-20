// Blackjack wallet: fichas, temas desbloqueáveis e tema ativo

// O 'id' tem de coincidir com [data-theme="..."] no CSS.
// Cada tema muda o visual todo (cores, tipografia, texturas, animações e ícones).
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
 * Guarda as fichas, os temas desbloqueados e o tema ativo.
 */
class Wallet {
    static START_CHIPS = 100;
    static MIN_BET = 10;
    static BET_STEP = 10;
    static STORAGE_KEY = 'blackjack25.wallet';

    constructor() {
        this.chips = Wallet.START_CHIPS;
        this.unlocked = ['verde'];
        this.theme = 'verde';
        this.load();
    }

    /** Lê o estado guardado no localStorage (se existir e for válido). */
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

    /** Grava o estado no localStorage. */
    save() {
        try {
            localStorage.setItem(Wallet.STORAGE_KEY, JSON.stringify({
                chips: this.chips, unlocked: this.unlocked, theme: this.theme
            }));
        } catch (e) { /* ignora */ }
    }

    /**
     * Indica se a aposta é válida.
     * @param {number} amount - Valor da aposta.
     * @returns {boolean}
     */
    canBet(amount) {
        return Number.isInteger(amount) && amount >= Wallet.MIN_BET && amount <= this.chips;
    }

    /**
     * Retira a aposta das fichas.
     * @param {number} amount - Valor da aposta.
     * @returns {boolean} - True se a aposta foi feita.
     */
    placeBet(amount) {
        if (!this.canBet(amount)) return false;
        this.chips -= amount;
        this.save();
        return true;
    }

    /**
     * Adiciona fichas (prémio ou devolução da aposta).
     * @param {number} amount - Fichas a adicionar.
     */
    add(amount) {
        this.chips += amount;
        this.save();
    }

    /** @returns {boolean} - True se o tema já está desbloqueado. */
    owns(themeId) {
        return this.unlocked.includes(themeId);
    }

    /**
     * Compra (desbloqueia) um tema e ativa-o.
     * @returns {boolean} - True se a compra foi feita.
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
     * Ativa um tema já desbloqueado.
     * @returns {boolean}
     */
    select(themeId) {
        if (!this.owns(themeId)) return false;
        this.theme = themeId;
        this.save();
        return true;
    }

    /**
     * Se já não der para apostar o mínimo, recomeça com as fichas iniciais (mantém os temas).
     * @returns {boolean} - True se houve recomeço.
     */
    rescueIfBroke() {
        if (this.chips >= Wallet.MIN_BET) return false;
        this.chips = Wallet.START_CHIPS;
        this.save();
        return true;
    }
}
