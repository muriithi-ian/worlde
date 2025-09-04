'use client';

import React from 'react';
import { MAX_ROUNDS, Feedback, TileState } from './constants';


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

export default GameBoard;
