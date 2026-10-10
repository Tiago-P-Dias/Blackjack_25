<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blackjack 25 - GitHub README</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background-color: #ffffff;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: .3em;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; border-bottom: none; }
    p, ul, ol {
      margin-top: 0;
      margin-bottom: 16px;
    }
    ul, ol {
      padding-left: 2em;
    }
    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27,31,35,0.05);
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #e1e4e8;
      border: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      background-color: #2ea44f;
      border-radius: 6px;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <h1>Blackjack 25 🃏</h1>

  <p>A modern, responsive, object-oriented web implementation of <strong>Blackjack 25</strong> built with HTML5, vanilla JavaScript (OOP), and Bootstrap 5.</p>

  <hr>

  <h2>🚀 Features</h2>
  <ul>
    <li><strong>Object-Oriented Architecture (OOP)</strong>: Clean, modular code separated into core game logic (<code>Blackjack</code> and <code>Card</code> classes)[cite: 3] and UI management (<code>blackjack_manager.js</code>)[cite: 2].</li>
    <li><strong>Custom Limit (25 Points)</strong>: A twist on classic Blackjack where the maximum point threshold is set to 25 instead of 21[cite: 1, 3].</li>
    <li><strong>Interactive Animations</strong>: Smooth card-dealing animations and a custom 3D card-flip effect for the dealer's hidden card[cite: 2, 4].</li>
    <li><strong>Fully Responsive UI</strong>: Styled with a custom theme built on Bootstrap 5[cite: 1, 4] supporting desktops, tablets, and mobile devices with adaptive layouts[cite: 4].</li>
    <li><strong>Dynamic Rules Modal</strong>: Built-in instructions and payout/scoring guides accessible right from the game table[cite: 1].</li>
  </ul>

  <hr>

  <h2>🛠️ Project Structure</h2>
  <pre><code>├── blackjack_oop.html      # Main HTML entry point & layout structure
├── js/
│   ├── blackjack_object.js # OOP Classes (Card & Blackjack game logic)
│   └── blackjack_manager.js# DOM manipulation, turn flow, and animations
├── css/
│   └── blackjack_style.css # Custom table styling, theme variables, and animations
└── img/
    └── svg/                # Card deck assets and card backs</code></pre>

  <hr>

  <h2>🕹️ How to Play</h2>
  <ol>
    <li><strong>Objective</strong>: Score as close to <strong>25 points</strong> as possible without going over[cite: 1]. Exceeding 25 results in an immediate "bust" (loss)[cite: 1].</li>
    <li><strong>Card Values</strong>:
      <ul>
        <li><strong>Aces</strong>: Worth 11 points, automatically drops to 1 point if the total hand exceeds 25[cite: 1, 3].</li>
        <li><strong>2 to 10</strong>: Face value[cite: 1].</li>
        <li><strong>Face Cards (Jack, Queen, King)</strong>: Worth 10 points each[cite: 1].</li>
      </ul>
    </li>
    <li><strong>Actions</strong>:
      <ul>
        <li><strong>Pedir carta (Hit)</strong>: Draw another card to your hand[cite: 1, 2].</li>
        <li><strong>Ficar (Stand)</strong>: End your turn and let the dealer play out their hand[cite: 1, 2].</li>
        <li><strong>Nova ronda (New Game)</strong>: Shuffle and start a fresh round[cite: 1, 2].</li>
      </ul>
    </li>
  </ol>

  <hr>

  <h2>🚀 Getting Started</h2>
  <p>To run the game locally, no complex build steps or backend servers are required:</p>
  <ol>
    <li>Clone or download this repository.</li>
    <li>Ensure you have the <code>css/</code>, <code>js/</code>, and <code>img/</code> folders correctly structured relative to <code>blackjack_oop.html</code>.</li>
    <li>Open <code>blackjack_oop.html</code> in any modern web browser.</li>
  </ol>

  <hr>

  <h2>📜 Credits & License</h2>
  <p>Created by <strong>Tiago Dias</strong> (2026)[cite: 1].</p>

</body>
</html>
