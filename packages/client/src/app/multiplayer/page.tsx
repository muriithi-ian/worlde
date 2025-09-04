// src/app/multiplayer/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import GameBoard from '@/components/GameBoard';
import { Feedback, MAX_ROUNDS } from '@/components/constants';



// --- Main Hotseat Game Page Component ---
export default function HotseatPage() {
    const [wordList, setWordList] = useState<string[]>([]);
    const [answer, setAnswer] = useState('');
    const [currentGuess, setCurrentGuess] = useState('');
    const [error, setError] = useState('');

    // A single state object to manage the entire game
    const [gameState, setGameState] = useState({
        guesses: { p1: [] as string[], p2: [] as string[] },
        feedback: { p1: [] as Feedback[], p2: [] as Feedback[] },
        currentTurn: 'p1' as 'p1' | 'p2',
        gameOver: { isOver: false, message: '' },
    });

    // Helper function to calculate feedback.
    const calculateFeedback = (guess: string, target: string): Feedback => {
        const results: Feedback = Array(5).fill('miss');
        const guessChars = guess.split('');
        const answerChars = target.split('');
        for (let i = 0; i < 5; i++) if (guessChars[i] === answerChars[i]) {
            results[i] = 'hit';
            answerChars[i] = '';
        }
        for (let i = 0; i < 5; i++) if (results[i] !== 'hit') {
            const charIndex = answerChars.indexOf(guessChars[i]);
            if (charIndex !== -1) {
                results[i] = 'present';
                answerChars[charIndex] = '';
            }
        }
        return results;
    };
    
    // Function to start or reset the game
    const startGame = useCallback(() => {
        if (wordList.length > 0) {
            const newAnswer = wordList[Math.floor(Math.random() * wordList.length)];
            setAnswer(newAnswer.toUpperCase());
            console.log(`New hotseat game. Answer: ${newAnswer.toUpperCase()}`); // For debugging
            
            setGameState({
                guesses: { p1: [], p2: [] },
                feedback: { p1: [], p2: [] },
                currentTurn: 'p1',
                gameOver: { isOver: false, message: '' },
            });
            setCurrentGuess('');
            setError('');
        }
    }, [wordList]);

    // Fetch the word list on component mount
    useEffect(() => {
        fetch('/wordlist.json')
            .then((res) => res.json())
            .then((words: string[]) => setWordList(words));
    }, []);

    // Start the game once the word list is loaded
    useEffect(() => {
        startGame();
    }, [startGame]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameState.gameOver.isOver) return;
        setError('');
        setCurrentGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5));
    };

    const handleGuessSubmit = () => {
        // --- Input Validation ---
        if (gameState.gameOver.isOver) return;
        if (currentGuess.length !== 5) {
            setError('Guess must be 5 letters long.');
            return;
        }
        if (!wordList.includes(currentGuess.toLowerCase())) {
            setError('Not a valid word.');
            return;
        }

        const currentPlayer = gameState.currentTurn;
        const feedback = calculateFeedback(currentGuess, answer);

        // --- State Update ---
        setGameState(prev => {
            const newGuesses = { ...prev.guesses, [currentPlayer]: [...prev.guesses[currentPlayer], currentGuess] };
            const newFeedback = { ...prev.feedback, [currentPlayer]: [...prev.feedback[currentPlayer], feedback] };

            // --- Win/Loss/Draw Logic ---
            if (currentGuess === answer) {
                return { ...prev, guesses: newGuesses, feedback: newFeedback, gameOver: { isOver: true, message: `Player ${currentPlayer === 'p1' ? 1 : 2} wins!` } };
            }
            if (newGuesses.p1.length === MAX_ROUNDS && newGuesses.p2.length === MAX_ROUNDS) {
                return { ...prev, guesses: newGuesses, feedback: newFeedback, gameOver: { isOver: true, message: `It's a draw! The word was: ${answer}` } };
            }

            // --- Switch Turns ---
            return { ...prev, guesses: newGuesses, feedback: newFeedback, currentTurn: prev.currentTurn === 'p1' ? 'p2' : 'p1' };
        });

        setCurrentGuess('');
    };
    
    const statusMessage = gameState.gameOver.isOver ? gameState.gameOver.message : `Player ${gameState.currentTurn === 'p1' ? 1 : 2}'s Turn`;

    return (
        <main className="flex min-h-screen flex-col items-center p-6 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Wordle Hotseat</h1>

            <div className="flex flex-col md:flex-row gap-8 items-start mb-4">
                <GameBoard title="Player 1" guesses={gameState.guesses.p1} feedback={gameState.feedback.p1} />
                <GameBoard title="Player 2" guesses={gameState.guesses.p2} feedback={gameState.feedback.p2} />
            </div>

            <div className="text-2xl font-bold h-8 mb-2">{statusMessage}</div>
            {error && <p className="text-red-500 h-6 mb-2">{error}</p>}

            {gameState.gameOver.isOver ? (
                <div className="mt-4 text-center space-y-4 flex flex-col">
                    <button onClick={startGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-center text-xl">Play Again</button>
                    <Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-center text-xl">Go Home</Link>
                </div>
            ) : (
                <input
                    autoFocus
                    type="text"
                    placeholder='Enter guess'
                    value={currentGuess}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
                    className="p-2 text-white bg-gray-800 text-center border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-white"
                />
            )}
        </main>
    );
}