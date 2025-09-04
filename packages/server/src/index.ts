// packages/server/src/index.ts
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const port = 3001;

// --- Game Data ---
// Load the word list from the JSON file. This is our dictionary.
const wordListPath = path.join(__dirname, "..", "wordlist.json");
const wordList: string[] = JSON.parse(fs.readFileSync(wordListPath, "utf8"));

// In-memory state for the current game. For a real application, you'd use a database
// or a more robust session management system.
let currentAnswer = "";

let candidateWords: string[] = [];

// --- Helper Functions ---

type Feedback = ("hit" | "present" | "miss")[];

/**
 * Calculates the feedback (hit, present, miss) for a guess against a potential answer.
 * @param guess The player's guess.
 * @param answer A potential answer from the word list.
 * @returns An array of feedback results.
 */
const calculateFeedback = (guess: string, answer: string): Feedback => {
	const results: Feedback = Array(5).fill("miss");
	const guessChars = guess.split("");
	const answerChars = answer.split("");

	// First pass for 'hits'
	for (let i = 0; i < 5; i++) {
		if (guessChars[i] === answerChars[i]) {
			results[i] = "hit";
			answerChars[i] = ""; // Nullify to prevent re-matching
		}
	}

	// Second pass for 'presents'
	for (let i = 0; i < 5; i++) {
		if (results[i] !== "hit") {
			const charIndex = answerChars.indexOf(guessChars[i]);
			if (charIndex !== -1) {
				results[i] = "present";
				answerChars[charIndex] = ""; // Nullify to prevent re-matching
			}
		}
	}
	return results;
};

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

/**
 * @route POST /new-game
 * @desc Starts a new game by selecting a new random word.
 */
app.post("/new-game", (req, res) => {
	// Critical Decision: We select a new answer from the full word list.
	// This ensures the game is always using a valid, predefined word.
	currentAnswer = wordList[Math.floor(Math.random() * wordList.length)];

	// For debugging purposes on the server console. Do not send the answer to the client.
	console.log(`New game started. The answer is: ${currentAnswer}`);

	res.json({ message: "New game started successfully." });
});

/**
 * @route POST /guess
 * @desc Validates and scores a player's guess.
 */
app.post("/guess", (req, res) => {
	const { guess } = req.body;
	const processedGuess = guess.toLowerCase();

	// Critical Decision: Input validation is crucial on the server.
	// We protect against invalid data formats and ensure the game rules are followed.
	if (!processedGuess || processedGuess.length !== 5) {
		return res
			.status(400)
			.json({ error: "Invalid guess: Must be 5 letters long." });
	}

	if (!wordList.includes(processedGuess)) {
		return res
			.status(400)
			.json({ error: "Not a valid word. Please try another." });
	}

	// --- Scoring Logic ---
	const results: ("hit" | "present" | "miss")[] = Array(5).fill("miss");
	const answerChars = currentAnswer.split("");
	const guessChars = processedGuess.split("");

	// First pass for correct letters in the correct spot ('hit').
	// We nullify the characters after matching to prevent them from being matched again.
	for (let i = 0; i < 5; i++) {
		if (guessChars[i] === answerChars[i]) {
			results[i] = "hit";
			answerChars[i] = ""; // Mark as used
		}
	}

	// Second pass for correct letters in the wrong spot ('present').
	for (let i = 0; i < 5; i++) {
		if (results[i] !== "hit") {
			const charIndex = answerChars.indexOf(guessChars[i]);
			if (charIndex !== -1) {
				results[i] = "present";
				answerChars[charIndex] = ""; // Mark as used
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
		...(isCorrect && { answer: currentAnswer }),
	});
});

/**
 * @route POST /cheating/new-game
 * @desc Initializes a new cheating game session.
 */
app.post("/hard/new-game", (req, res) => {
	// Critical Decision: We start with the entire word list as potential candidates.
	// The game hasn't "decided" on an answer yet.
  //pick a random index and pick 6 words
	const randomIndex = Math.floor(Math.random() * wordList.length);
  if (randomIndex > wordList.length - 14) { //edge case
		candidateWords = wordList.slice(-14);
	} else {
		candidateWords = wordList.slice(randomIndex, randomIndex + 14);
	}

	console.log(
		`Hard game started with ${candidateWords} possible words.`
	);
	res.json({ message: "New hard game started." });
});

/**
 * @route POST /hard/guess
 * @desc Processes a guess in the hard mode.
 */
app.post("/hard/guess", (req, res) => {
	const { guess } = req.body;
	const processedGuess = guess.toLowerCase();

	// Standard validation
	if (!processedGuess || processedGuess.length !== 5) {
		return res
			.status(400)
			.json({ error: "Invalid guess: Must be 5 letters long." });
	}
	if (!wordList.includes(processedGuess)) {
		return res.status(400).json({ error: "Not a valid word." });
	}

	// --- The Cheating Algorithm ---

	// 1. Group all current candidates by the feedback they would produce for the user's guess.
	const feedbackGroups: Map<string, string[]> = new Map();
	for (const candidate of candidateWords) {
		const feedback = calculateFeedback(processedGuess, candidate);
		const feedbackKey = feedback.join(","); // Use a string key like "hit,miss,present,..."

		if (!feedbackGroups.has(feedbackKey)) {
			feedbackGroups.set(feedbackKey, []);
		}
		feedbackGroups.get(feedbackKey)!.push(candidate);
	}

	// 2. Find the largest group. This is the "best" move for the host, as it
	//    leaves the most ambiguity for the player.
	let bestFeedbackKey = "";
	let largestGroupSize = -1;

	for (const [key, group] of feedbackGroups.entries()) {
		if (group.length > largestGroupSize) {
			largestGroupSize = group.length;
			bestFeedbackKey = key;
		}
	}

	// 3. Update the candidate list to be the members of the largest group.
	candidateWords = feedbackGroups.get(bestFeedbackKey) || [];
	console.log(
		`Player guessed '${processedGuess}'. Best feedback is '${bestFeedbackKey}'. ${candidateWords} words remaining.`
	);

	const results = bestFeedbackKey.split(",") as Feedback;
	const isCorrect =
		candidateWords.length === 1 && candidateWords[0] === processedGuess;

	// If the player wins, the final answer is the last remaining word.
	const finalAnswer = isCorrect ? candidateWords[0] : "";

	res.json({
		results,
		isCorrect,
		// Only reveal the answer if the player has won.
		...(isCorrect && { answer: finalAnswer.toUpperCase() }),
		// For debugging, we can send the remaining word count.
		remaining: candidateWords.length,
	});
});

app.listen(port, () => {
	console.log(`Wordle server is running on http://localhost:${port}`);
});
