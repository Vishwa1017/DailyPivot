import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Daily Pivot
        </h1>

        <button
          className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition"
          onClick={() => router.push("/login")}>
          Login
        </button>
      </main>
    </div>
  );
}