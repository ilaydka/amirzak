import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Giriş Yap
        </h1>

        <LoginForm />
      </div>
    </main>
  );
}