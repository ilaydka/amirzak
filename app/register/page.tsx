import Image from "next/image";

import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-surface p-8 shadow-md">
        <div className="mb-8 text-center">
          <Image
            src="/brand/amirzak-logo.png"
            alt="AMİRZAK"
            width={310}
            height={110}
            priority
            className="mx-auto h-auto w-[220px] object-contain"
          />

          <h1 className="display-title mt-5 text-3xl text-text">
            Hesap Oluştur
          </h1>

          <p className="mt-2 text-sm leading-6 text-text-soft">
            AMİRZAK&apos;a katılın ve alışveriş deneyiminizi
            kişiselleştirmeye başlayın.
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}