// src/app/server/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const MAX_ROUNDS = 6;
const API_URL = 'http://localhost:3001';

// Define types for better code quality and readability
type TileState = 'hit' | 'present' | 'miss';
interface GuessResult {
  guess: string;
  results: TileState[];
}

export default function ServerWordlePage() {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setGameOver] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [error, setError] = useState('');

  // Function to start or reset the game
  const startGame = useCallback(async () => {
    // Critical Decision: The game state is managed by the server.
    // The client just needs to send a request to start a new game.
    await fetch(`${API_URL}/new-game`, { method: 'POST' });
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setFinalAnswer('');
    setError('');
  }, []);

  // Start the first game when the component mounts
  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameOver) return;
    setError(''); // Clear error on new input
    setCurrentGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5));
  };

  const handleGuessSubmit = async () => {
    if (currentGuess.length !== 5) {
      setError('Your guess must be 5 letters long.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: currentGuess }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'An unknown error occurred.');
      }

      const data = await response.json();
      const newGuesses = [...guesses, { guess: currentGuess, results: data.results }];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (data.isCorrect || newGuesses.length === MAX_ROUNDS) {
        setGameOver(true);
        // The server will provide the answer only when the game ends
        setFinalAnswer(data.answer || 'The word was not revealed.'); 
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getTileClass = (state: TileState | undefined) => {
    if (!state) return 'border-gray-600';
    switch (state) {
      case 'hit': return 'bg-green-500';
      case 'present': return 'bg-yellow-500';
      case 'miss': return 'bg-gray-700';
      default: return 'border-gray-600';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Wordle (Server-Side)</h1>
      <div className="grid grid-rows-6 gap-2 mb-8">
        {Array.from({ length: MAX_ROUNDS }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const guessResult = guesses[rowIndex];
              const letter = guessResult?.guess[colIndex] || (rowIndex === guesses.length ? currentGuess[colIndex] : '') || '';
              const tileClass = getTileClass(guessResult?.results[colIndex]);
              return (
                <div
                  key={colIndex}
                  className={`w-16 h-16 border-2 flex items-center justify-center text-2xl font-bold ${tileClass}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        autoFocus
        type="text"
        placeholder="Enter your guess"
        value={currentGuess}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
        className="p-2 text-white bg-gray-800 text-center border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-white"
        disabled={isGameOver}
        hidden={isGameOver}
      />
      {isGameOver && (
        <div className="mt-4 text-center space-y-4 flex flex-col">
          <div className="text-xl">
            {guesses.some(g => g.results.every(r => r === 'hit')) ? 'You won!' : `You lost!`}
          </div>
          <button
            onClick={startGame}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Play Again
          </button>
          <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-center text-xl">
            Go Home
          </Link>
        </div>
      )}
    </main>
  );
}