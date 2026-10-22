<!DOCTYPE html>
<html lang="en">
  <h1>Blackjack 25 🃏</h1>

  <p>A modern, responsive, object-oriented web implementation of <strong>Blackjack 25</strong> built with HTML5, vanilla JavaScript (OOP), and Bootstrap 5.</p>

  <hr>

  <h2>🚀 Features</h2>
  <ul>
    <li><strong>Object-Oriented Architecture (OOP)</strong>: Clean, modular code separated into core game logic (<code>Blackjack</code> and <code>Card</code> classes) and UI management (<code>blackjack_manager.js</code>).</li>
    <li><strong>Custom Limit (25 Points)</strong>: A twist on classic Blackjack where the maximum point threshold is set to 25 instead of 21.</li>
    <li><strong>Interactive Animations</strong>: Smooth card-dealing animations and a custom 3D card-flip effect for the dealer's hidden card.</li>
    <li><strong>Fully Responsive UI</strong>: Styled with a custom theme built on Bootstrap 5 supporting desktops, tablets, and mobile devices with adaptive layouts.</li>
    <li><strong>Dynamic Rules Modal</strong>: Built-in instructions and payout/scoring guides accessible right from the game table.</li>
  </ul>

  <hr>

  <h2>🛠️ Project Structure</h2>
  <pre><code>├── index.html                # Main HTML entry point & layout structure
├── js/
│   ├── blackjack_object.js   # OOP Classes (Card & Blackjack game logic)
│   └── blackjack_manager.js  # DOM manipulation, turn flow, and animations
|   └── blackjack_themes.js
|   └── blackjack_wallet.js 
├── css/
│   └── blackjack_style.css   # Custom table styling, theme variables, and animations
└── img/
    └── svg/                  # Card deck assets and card backs</code></pre>

  <hr>

  <h2>🕹️ How to Play</h2>
  <ol>
    <li><strong>Objective</strong>: Score as close to <strong>25 points</strong> as possible without going over. Exceeding 25 results in an immediate "bust" (loss).</li>
    <li><strong>Card Values</strong>:
      <ul>
        <li><strong>Aces</strong>: Worth 11 points, automatically drops to 1 point if the total hand exceeds 25.</li>
        <li><strong>2 to 10</strong>: Face value.</li>
        <li><strong>Face Cards (Jack, Queen, King)</strong>: Worth 10 points each.</li>
      </ul>
    </li>
    <li><strong>Actions</strong>:
      <ul>
        <li><strong>Pedir carta (Hit)</strong>: Draw another card to your hand.</li>
        <li><strong>Ficar (Stand)</strong>: End your turn and let the dealer play out their hand.</li>
        <li><strong>Nova ronda (New Game)</strong>: Shuffle and start a fresh round.</li>
      </ul>
    </li>
  </ol>

  <hr>

  <h2>🚀 Getting Started</h2>
  <p>To run the game locally, no complex build steps or backend servers are required:</p>
  <ol>
    <li>Clone or download this repository.</li>
    <li>Ensure you have the <code>css/</code>, <code>js/</code>, and <code>img/</code> folders correctly structured relative to <code>index.html</code>.</li>
    <li>Open <code>index.html</code> in any modern web browser.</li>
  </ol>

  <hr>

  <h2>📜 Credits & License</h2>
  <p>Created by <strong>Tiago Dias</strong> (2026).</p>

</body>
</html>
