import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Utility helpers
 */
const LINES = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // cols
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diags
  [2, 4, 6],
];

/**
 * Determine winner of a given board.
 * @param {Array<string|null>} board - 9-length array with 'X', 'O' or null.
 * @returns {{winner: 'X'|'O'|null, line: number[]|null}}
 */
function calculateWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * Get list of available moves (empty indices)
 */
function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) moves.push(i);
  }
  return moves;
}

/**
 * Basic AI strategies:
 * - Try to win
 * - Block opponent win
 * - Take center
 * - Take a corner
 * - Take a side
 */
function aiMove(board, aiPlayer) {
  const human = aiPlayer === 'X' ? 'O' : 'X';
  const moves = availableMoves(board);
  if (moves.length === 0) return null;

  // Try to win
  for (const m of moves) {
    const copy = [...board];
    copy[m] = aiPlayer;
    if (calculateWinner(copy).winner === aiPlayer) return m;
  }

  // Block opponent
  for (const m of moves) {
    const copy = [...board];
    copy[m] = human;
    if (calculateWinner(copy).winner === human) return m;
  }

  // Take center
  if (board[4] == null) return 4;

  // Take a corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] == null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // Take a side
  const sides = [1, 3, 5, 7].filter((i) => board[i] == null);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return moves[0];
}

/**
 * Small labeled toggle group for mode selection
 */
function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Game mode">
      <button
        className={`btn${mode === 'PVP' ? ' active' : ''}`}
        onClick={() => setMode('PVP')}
        aria-pressed={mode === 'PVP'}
      >
        2 Players
      </button>
      <button
        className={`btn${mode === 'AI' ? ' active' : ''}`}
        onClick={() => setMode('AI')}
        aria-pressed={mode === 'AI'}
      >
        vs AI
      </button>
    </div>
  );
}

/**
 * Square component
 */
function Square({ value, onClick, highlight, index }) {
  return (
    <button
      className={`square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={`Square ${index + 1}, ${value ? value : 'empty'}`}
    >
      {value}
    </button>
  );
}

/**
 * Board component
 */
function Board({ board, onPlay, winningLine, disabled }) {
  const renderSquare = (i) => {
    const highlight = winningLine?.includes(i);
    return (
      <Square
        key={i}
        index={i}
        value={board[i]}
        onClick={() => onPlay(i)}
        highlight={highlight}
      />
    );
  };

  return (
    <div className={`board${disabled ? ' disabled' : ''}`}>
      <div className="row">{[0, 1, 2].map(renderSquare)}</div>
      <div className="row">{[3, 4, 5].map(renderSquare)}</div>
      <div className="row">{[6, 7, 8].map(renderSquare)}</div>
    </div>
  );
}

/**
 * Header title
 */
function Title() {
  return (
    <div className="title-wrap">
      <h1 className="app-title">Tic Tac Toe</h1>
      <p className="subtitle">Simple. Minimal. Fun.</p>
    </div>
  );
}

/**
 * Footer attribution (kept minimal)
 */
function Footer() {
  return (
    <footer className="footer">
      <span>Built with React</span>
    </footer>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme] = useState('light'); // fixed light as requested theme
  const [mode, setMode] = useState('AI'); // 'PVP' or 'AI'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [aiPlays, setAiPlays] = useState('O'); // which mark AI uses in AI mode
  const { winner, line } = useMemo(() => calculateWinner(board), [board]);
  const isDraw = !winner && availableMoves(board).length === 0;
  const currentPlayer = xIsNext ? 'X' : 'O';

  // theme applied to root for CSS variables handling if needed later
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // AI turn effect
  useEffect(() => {
    if (mode !== 'AI') return;
    if (winner || isDraw) return;
    if (currentPlayer !== aiPlays) return;

    const id = setTimeout(() => {
      const move = aiMove(board, aiPlays);
      if (move != null) {
        setBoard((b) => {
          if (b[move]) return b;
          const copy = [...b];
          copy[move] = aiPlays;
          return copy;
        });
        setXIsNext((p) => !p);
      }
    }, 350); // small delay for natural feel

    return () => clearTimeout(id);
  }, [mode, aiPlays, board, currentPlayer, winner, isDraw]);

  const handlePlay = (index) => {
    if (winner || isDraw) return;
    if (board[index]) return;

    // If AI mode and it's AI's turn, ignore user click
    if (mode === 'AI' && currentPlayer === aiPlays) return;

    const copy = [...board];
    copy[index] = currentPlayer;
    setBoard(copy);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    /**
     * Reset the game to initial state.
     */
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  // PUBLIC_INTERFACE
  const restartAndSwap = () => {
    /**
     * Restart the game and swap the starting player for variety.
     */
    setBoard(Array(9).fill(null));
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const toggleAiSide = () => {
    /**
     * Switch AI side between X and O. Resets the game for clarity.
     */
    setAiPlays((prev) => (prev === 'X' ? 'O' : 'X'));
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const statusMessage = (() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "It's a draw";
    return `Turn: ${currentPlayer}`;
  })();

  return (
    <div className="App">
      <main className="container">
        <Title />

        <section className="panel">
          <div className="status">
            <div className="pill turn">
              <span className={`mark ${currentPlayer === 'X' ? 'x' : 'o'}`}>
                {winner ? '' : currentPlayer}
              </span>
              <span className="label">{statusMessage}</span>
            </div>

            {winner && (
              <div className="pill winner">
                <span className="tada">🏆</span>
                <span className="label">Congratulations!</span>
              </div>
            )}
          </div>

          <ModeToggle mode={mode} setMode={(m) => { setMode(m); resetGame(); }} />

          {mode === 'AI' && (
            <div className="ai-side">
              <span className="ai-label">AI plays: </span>
              <button
                className={`chip ${aiPlays === 'X' ? 'active' : ''}`}
                onClick={() => { if (aiPlays !== 'X') toggleAiSide(); }}
                aria-pressed={aiPlays === 'X'}
              >
                X
              </button>
              <button
                className={`chip ${aiPlays === 'O' ? 'active' : ''}`}
                onClick={() => { if (aiPlays !== 'O') toggleAiSide(); }}
                aria-pressed={aiPlays === 'O'}
              >
                O
              </button>
            </div>
          )}
        </section>

        <Board
          board={board}
          onPlay={handlePlay}
          winningLine={line}
          disabled={Boolean(winner)}
        />

        <section className="controls">
          <button className="btn primary" onClick={resetGame}>Reset</button>
          <button className="btn accent" onClick={restartAndSwap}>Restart & Swap</button>
        </section>

        <Footer />
      </main>
    </div>
  );
}

export default App;
