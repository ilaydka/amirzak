import Image from "next/image";

import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-surface p-8 shadow-md">
        <div className="mb-8 text-center">
          <Image
            src="/brand/amirzak-logo.png"
            alt="AMİRZAK"
            width={280}
            height={100}
            priority
            className="mx-auto h-auto w-[220px] object-contain"
          />

          <h1 className="display-title mt-6 text-3xl text-text">
            Giriş Yap
          </h1>

          <p className="mt-2 text-sm leading-6 text-text-soft">
            Hesabınıza giriş yaparak siparişlerinize,
            sepetinize ve profilinize erişin.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}