import { createSignal, createEffect, For } from 'solid-js';
import { createStore } from 'solid-js/store';

const Connect4 = () => {
  const nr = 6;
  const nc = 7;

  const [board, setBoard] = createStore(Array(nr).fill().map(() => Array(nc).fill(null)));
  const [currentPlayer, setCurrentPlayer] = createSignal('red');
  const [winner, setWinner] = createSignal(null);
  const [gameOver, setGameOver] = createSignal(false);
  const [lastMove, setLastMove] = createSignal(null);

  const checkWin = (gameboard, row, col, player) => {
    // check like this: --
    for (let c = 0; c <= nc - 4; c++) {
      for (let r = 0; r < nr; r++) {
        if (gameboard[r][c] === player &&
            gameboard[r][c + 1] === player &&
            gameboard[r][c + 2] === player &&
            gameboard[r][c + 3] === player) {
          return true;
        }
      }
    }

    // check like this: |
    for (let c = 0; c < nc; c++) {
      for (let r = 0; r <= nr - 4; r++) {
        if (gameboard[r][c] === player &&
            gameboard[r + 1][c] === player &&
            gameboard[r + 2][c] === player &&
            gameboard[r + 3][c] === player) {
          return true;
        }
      }
    }

    // check like this: /
    for (let c = 0; c <= nc - 4; c++) {
      for (let r = 0; r <= nr - 4; r++) {
        if (gameboard[r][c] === player &&
            gameboard[r + 1][c + 1] === player &&
            gameboard[r + 2][c + 2] === player &&
            gameboard[r + 3][c + 3] === player) {
          return true;
        }
      }
    }

    // check like this: \
    for (let c = 0; c <= nc - 4; c++) {
      for (let r = 3; r < nr; r++) {
        if (gameboard[r][c] === player &&
            gameboard[r - 1][c + 1] === player &&
            gameboard[r - 2][c + 2] === player &&
            gameboard[r - 3][c + 3] === player) {
          return true;
        }
      }
    }

    return false;
  };

  const checkDraw = () => {
    return board.every(row => row.every(cell => cell !== null));
  };

  const drop = (col) => {
    if (gameOver()) return;

    let row = nr - 1;
    while (row >= 0 && board[row][col] !== null) {
      row--;
    }

    if (row < 0) return;

    const new_board = board.map(row => [...row]);
    new_board[row][col] = currentPlayer();
    setLastMove({ row, col });

    if (checkWin(new_board, row, col, currentPlayer())) {
      setBoard(new_board);
      setWinner(currentPlayer());
      setGameOver(true);
    } else if (checkDraw()) {
      setBoard(new_board);
      setGameOver(true);
    } else {
      setBoard(new_board);
      setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
    }
  };

  const reset = () => {
    setBoard(Array(nr).fill().map(() => Array(nc).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setGameOver(false);
    setLastMove(null);
  };

  const droptime = (row) => {
    const b = 50;
    return `${(row + 1) * b}ms`;
  };

  return (
    <div class="flex flex-col items-center justify-center gap-8 p-8">
      <div class={`text-2xl font-bold mb-4 ${winner() ? 'animate-bounce' : ''}`}>
        {winner() ? `${winner().charAt(0).toUpperCase() + winner().slice(1)} Wins!` :
         gameOver() ? 'Draw!' : `Current Player: ${currentPlayer().charAt(0).toUpperCase() + currentPlayer().slice(1)}`}
      </div>

      <div class="relative">
        <div class="absolute -top-16 left-0 right-0 flex">
          <For each={Array(nc).fill()}>
            {(_, colIndex) => (
              <div class="w-16 mx-1">
                <div
                  class={`w-14 h-14 rounded-full mx-auto transform transition-all duration-200
                    ${currentPlayer() === 'red' ? 'bg-red-200' : 'bg-yellow-200'}
                    ${!gameOver() ? 'hover:scale-100 opacity-0 hover:opacity-50' : 'opacity-0'}
                  `}
                />
              </div>
            )}
          </For>
        </div>

        <div class="bg-blue-600 p-4 rounded-lg shadow-lg">
          <For each={board}>
            {(row, ri) => (
              <div class="flex">
                <For each={row}>
                  {(cell, ci) => (
                    <div
                      class="w-16 h-16 bg-white m-1 rounded-full cursor-pointer hover:bg-gray-100 relative"
                      onClick={() => drop(ci())}
                    >
                      {cell && (
                        <div
                          class={`absolute inset-1 rounded-full transform transition-all
                            ${cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'}
                            ${lastMove()?.row === ri() && lastMove()?.col === ci() ?
                              'animate-piece-drop' : 'scale-100'}
                            ${winner() && cell === winner() ? 'animate-pulse' : ''}
                          `}
                          style={{
                            '--drop-duration': droptime(ri()),
                            'animation-delay': lastMove()?.row === ri() && lastMove()?.col === ci() ?
                              '0ms' : 'initial'
                          }}
                        />
                      )}
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>

      <button
        class="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600
               transition-colors transform hover:scale-105 active:scale-95"
        onClick={reset}
      >
        New Game
      </button>

      <style>{`
        @keyframes piece-drop {
          0% {
            transform: translateY(-400%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-piece-drop {
          animation: piece-drop var(--drop-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default Connect4;
