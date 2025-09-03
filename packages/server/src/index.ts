// packages/server/src/index.ts
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;

// --- Game Data ---
// Load the word list from the JSON file. This is our dictionary.
const wordListPath = path.join(__dirname, '..', 'wordlist.json');
const wordList: string[] = JSON.parse(fs.readFileSync(wordListPath, 'utf8'));

// In-memory state for the current game. For a real application, you'd use a database
// or a more robust session management system.
let currentAnswer = '';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

/**
 * @route POST /new-game
 * @desc Starts a new game by selecting a new random word.
 */
app.post('/new-game', (req, res) => {
  // Critical Decision: We select a new answer from the full word list.
  // This ensures the game is always using a valid, predefined word.
  currentAnswer = wordList[Math.floor(Math.random() * wordList.length)];
  
  // For debugging purposes on the server console. Do not send the answer to the client.
  console.log(`New game started. The answer is: ${currentAnswer}`); 
  
  res.json({ message: 'New game started successfully.' });
});

/**
 * @route POST /guess
 * @desc Validates and scores a player's guess.
 */
app.post('/guess', (req, res) => {
  const { guess } = req.body;
  const processedGuess = guess.toLowerCase();

  // Critical Decision: Input validation is crucial on the server.
  // We protect against invalid data formats and ensure the game rules are followed.
  if (!processedGuess || processedGuess.length !== 5) {
    return res.status(400).json({ error: 'Invalid guess: Must be 5 letters long.' });
  }

  if (!wordList.includes(processedGuess)) {
    return res.status(400).json({ error: 'Not a valid word. Please try another.' });
  }

  // --- Scoring Logic ---
  const results: ('hit' | 'present' | 'miss')[] = Array(5).fill('miss');
  const answerChars = currentAnswer.split('');
  const guessChars = processedGuess.split('');

  // First pass for correct letters in the correct spot ('hit').
  // We nullify the characters after matching to prevent them from being matched again.
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === answerChars[i]) {
      results[i] = 'hit';
      answerChars[i] = ''; // Mark as used
    }
  }

  // Second pass for correct letters in the wrong spot ('present').
  for (let i = 0; i < 5; i++) {
    if (results[i] !== 'hit') {
      const charIndex = answerChars.indexOf(guessChars[i]);
      if (charIndex !== -1) {
        results[i] = 'present';
        answerChars[charIndex] = ''; // Mark as used
      }
    }
  }

  const isCorrect = processedGuess === currentAnswer;
  
  // Critical Decision: Only send the answer back if the game is won or lost.
  // This prevents the client from ever knowing the answer prematurely.
  res.json({ 
    results, 
    isCorrect,
    // Conditionally add the answer to the response if the guess is correct
    ...(isCorrect && { answer: currentAnswer }) 
  });
});

app.listen(port, () => {
  console.log(`Wordle server is running on http://localhost:${port}`);
});