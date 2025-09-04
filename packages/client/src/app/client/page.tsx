'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MAX_ROUNDS } from '@/components/constants';

export default function Home() {
  const [wordList, setWordList] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setGameOver] = useState(false);

  // Fetch the word list and select a random word
  useEffect(() => {
    fetch('/wordlist.json')
      .then((res) => res.json())
      .then((words: string[]) => {
        setWordList(words);
        setAnswer(words[Math.floor(Math.random() * words.length)]);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameOver) return;
    // Allow only letters and limit to 5 characters
    setCurrentGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5));
  };

  const handleGuessSubmit = () => {
    if (currentGuess.length !== 5) {
      alert('Your guess must be 5 letters long.');
      return;
    }

    //check if currentGuess is in wordList
    if (!wordList.includes(currentGuess.toLowerCase())) {
      alert('Invalid word. Please try another word.');
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toLowerCase() === answer || newGuesses.length === MAX_ROUNDS) {
      setGameOver(true);
    }
  };

  //replay
  const resetGame = () => {
    // Pick a new random word from the current word list
    const newAnswer = wordList[Math.floor(Math.random() * wordList.length)];

    // Reset state
    setAnswer(newAnswer);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
  };


  // Determine the color of each letter tile
  const getTileClass = (letter: string, index: number, guess: string) => {
    if (answer.includes(letter.toLowerCase())) {
      if (answer[index] === letter.toLowerCase()) {
        return 'bg-green-500'; // Hit
      }
      return 'bg-yellow-500'; // Present
    }
    return 'bg-gray-700'; // Miss
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Wordle</h1>
      <div className="grid grid-rows-6 gap-2 mb-8">
        {Array.from({ length: MAX_ROUNDS }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const guess = guesses[rowIndex] || '';
              const letter = guess[colIndex] || (rowIndex === guesses.length ? currentGuess[colIndex] : '') || '';
              const tileClass = rowIndex < guesses.length ? getTileClass(letter, colIndex, guess) : 'border-gray-600';
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
      <input
        autoFocus
        type="text"
        placeholder='Enter your guess'
        value={currentGuess}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
        className="p-2 text-white text-center border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-white"
        disabled={isGameOver}
        hidden={isGameOver}
      />
      {isGameOver && (
        <>
          <div className="mt-4 text-center space-y-4 flex flex-col">
            {guesses.includes(answer) ? 'You won!' : `You lost! The word was: ${answer}`}
          </div>
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Play Again
          </button>
          <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-center text-xl">
            Go Home
          </Link>
        </>
      )}

    </main>
  );
}