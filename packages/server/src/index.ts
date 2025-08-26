import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Wordle Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});