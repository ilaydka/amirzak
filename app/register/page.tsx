import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Hesap Oluştur
        </h1>

        <RegisterForm />
      </div>
    </main>
  );
}