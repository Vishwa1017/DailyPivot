import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Daily Pivot
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Track your daily pivot levels and improve your trading strategy.
        </p>

        <button className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition">
          Get Started
        </button>
      </main>
    </div>
  );
}