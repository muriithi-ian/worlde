// src/app/page.tsx
import Link from 'next/link';

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
      </div>
    </main>
  );
}