# Multi-Mode Wordle

This project is a web-based implementation of the popular word-guessing game, Wordle, built with a modern tech stack. It features multiple game modes, including single-player, a challenging "cheating host" mode, and both local two-player options.

## Game Modes

### Single Player
*   **Client-Side (1P):** The classic Wordle experience. The entire game runs in your browser, making it fast and perfect for offline play.
*   **Server-Side (1P):** A standard Wordle game where the secret word and guess validation are handled securely by a backend server.
*   **Hard Mode (1P):** Also known as "Absurdle" or "Cheating Host." In this mode, the game doesn't pick a single word at the start. Instead, it uses your guesses to narrow down a list of possible answers, always choosing the path that keeps the most options available, making the game as difficult as possible.

### Multi-Player
*   **Hotseat (2P):** A local multiplayer mode where two players take turns on the same computer, competing to be the first to guess the same secret word.

## Tech Stack

*   **Frontend (Client):** Next.js, React, TypeScript, Tailwind CSS
*   **Backend (Server):** Node.js, Express, TypeScript
*   **Package Management:** npm Workspaces in a monorepo structure.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup and Installation

This project uses an npm monorepo to manage the client and server packages. You only need to run the installation command from the root directory.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/muriithi-ian/worlde.git
    cd worlde
    ```

2.  **Install all dependencies:**
    This single command will install the necessary packages for both the `client` and `server` workspaces.
    ```sh
    npm install
    ```

    Alternatively, you can install dependencies for each workspace individually:

    ```sh
    cd packages/client
    npm install
    ```
    In another terminal:
    
    ```sh
    cd packages/server
    npm install
    ```

## Running the Application

To run both the frontend and backend servers simultaneously, use the `start` script from the root of the project.

```sh
npm run start
```

This will concurrently execute:
*   The **Next.js frontend** on `http://localhost:3000`
*   The **Node.js backend server** on `http://localhost:3001`

Alternatively, you can run the frontend and backend servers separately in separate terminals for the same result:

1. Start the **Next.js frontend**:
   ```sh
   cd packages/client
   npm run dev
   ```

2. Start the **Node.js backend server**:
   ```sh
   cd packages/server
   npm run dev
   ```




Open your browser and navigate to `http://localhost:3000` to see the start page and choose a game mode.

```sh
npm run start
```

This will concurrently execute:
*   The **Next.js frontend** on `http://localhost:3000`
*   The **Node.js backend server** on `http://localhost:3001`

Open your browser and navigate to `http://localhost:3000` to see the start page and choose a game mode.

## Project Structure

The project is organized as a monorepo with two main packages:

*   `packages/client/`: Contains the Next.js frontend application.
*   `packages/server/`: Contains the Node.js Express backend server.

