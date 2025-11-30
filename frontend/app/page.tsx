import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container py-12">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">TODO Manager</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Завдання скоро будуть тут
              </h1>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Stage 3 scaffold
            </span>
          </div>
          <p className="mt-6 text-slate-600">
            UI та інтеграцію буде додано на наступних етапах. API фронту вже проксить запити
            до бекенду через /api/tasks.
          </p>
          <p className="mt-3 text-slate-600">
            Бекенд FastAPI: <Link href="http://localhost:8000/docs">http://localhost:8000/docs</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
