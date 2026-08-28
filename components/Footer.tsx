import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex min-h-[82px] max-w-7xl flex-col gap-4 px-6 py-4 md:h-[82px] md:flex-row md:items-center md:justify-between md:gap-8 md:py-0">
        <Link
          href="/"
          aria-label="AMİRZAK Ana Sayfa"
          className="inline-flex items-center"
        >
          <Image
            src="/brand/amirzak-logo.png"
            alt="AMİRZAK"
            width={380}
            height={135}
            className="h-auto w-[230px] object-contain"
          />
        </Link>

        <div className="flex items-center gap-3 whitespace-nowrap text-sm">
          <span className="font-semibold text-text">
            İletişim
          </span>

          <span className="h-4 w-px bg-border" />

          <span className="text-text-muted">
            Soru ve önerileriniz için
          </span>

          <a
            href="mailto:ilaydakrln@gmail.com"
            className="font-semibold text-brand transition hover:opacity-70"
          >
            Bize ulaşın
          </a>
        </div>

        <p className="whitespace-nowrap text-sm text-text-muted">
          © 2026 AMİRZAK. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}