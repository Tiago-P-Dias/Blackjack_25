/**
 * A visual theme that can be unlocked in the shop.
 * @typedef {Object} Theme
 * @property {string} id - Unique id, also used as the value of the data-theme attribute.
 * @property {string} name - Name shown in the shop.
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
        id: 'verde', name: 'Clássico',
        desc: 'A mesa de feltro verde tradicional.',
        font: '"Segoe UI", Arial, sans-serif',
        swatch: ['#1b5945', '#123a30'], accent: '#d7b56d',
        brandIcon: 'bi-suit-spade-fill', dividerIcon: 'bi-gem',
        tagline: 'Que a sorte esteja do teu lado'
    },
    {
        id: 'arcade', name: 'Arcade',
        desc: 'Pixéis, scanlines de CRT e sombras duras.',
        font: '"Press Start 2P", "Courier New", monospace',
        swatch: ['#26216a', '#0a0820'], accent: '#ffe135',
        brandIcon: 'bi-controller', dividerIcon: 'bi-joystick',
        tagline: 'Insere uma moeda e joga'
    },
    {
        id: 'oceano', name: 'Fundo do Mar',
        desc: 'Bolhas a subir, raios de luz e ondas na mesa.',
        font: '"Fredoka", "Segoe UI", sans-serif',
        swatch: ['#12809c', '#032a3d'], accent: '#ffcf6b',
        brandIcon: 'bi-water', dividerIcon: 'bi-droplet-fill',
        tagline: 'A sorte vem com a maré'
    },
    {
        id: 'neon', name: 'Las Vegas Neon',
        desc: 'Néon, grelha em movimento e letreiro a piscar.',
        font: '"Orbitron", "Segoe UI", sans-serif',
        swatch: ['#ff2bd6', '#06010e'], accent: '#5ff4ff',
        brandIcon: 'bi-lightning-charge-fill', dividerIcon: 'bi-suit-diamond-fill',
        tagline: 'As luzes nunca se apagam'
    },
    {
        id: 'espaco', name: 'Galáxia',
        desc: 'Estrelas a cintilar, nebulosas e estrela cadente.',
        font: '"Exo 2", "Segoe UI", sans-serif',
        swatch: ['#2a1d63', '#05030f'], accent: '#8fd8ff',
        brandIcon: 'bi-moon-stars-fill', dividerIcon: 'bi-stars',
        tagline: 'Que a sorte seja estelar'
    }
];