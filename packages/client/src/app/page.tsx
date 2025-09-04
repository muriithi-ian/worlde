// src/app/page.tsx
'use client';

import Link from 'next/link';



// --- Game Board Component ---
// This is a stateless component that just renders the board based on props.
const GameBoard = ({ title, guesses, feedback }: { title: string; guesses: string[]; feedback: Feedback[] }) => {
    const getTileClass = (state?: TileState) => {
        if (!state) return 'border-gray-600';
        return { hit: 'bg-green-500', present: 'bg-yellow-500', miss: 'bg-gray-700' }[state];
    };

    return (
        <div>
            <h2 className="text-xl text-center mb-2">{title}</h2>
            <div className="grid grid-rows-6 gap-1.5">
                {Array.from({ length: MAX_ROUNDS }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold ${getTileClass(feedback[rowIndex]?.[colIndex])}`}
                            >
                                {guesses[rowIndex]?.[colIndex] ?? ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function StartPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10 bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-12">Wordle</h1>
      <div className="flex flex-col gap-4">
        <Link href="/client" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-center text-xl">
          Play Client-Side
        </Link>
        <Link href="/server" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-center text-xl">
          Play Server-Side
        </Link>
        <Link href="/hard" className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded text-center text-xl">
          Play Server-Side (Difficult Host)
        </Link>
        <Link href="/multiplayer" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-center text-xl">
          Play Multiplayer (Hotseat)
        </Link>
      </div>
    </main>
  );
}