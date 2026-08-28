import Link from "next/link";

export default function CheckoutButton() {
  return (
    <Link
      href="/checkout"
      className="brand-button min-h-12 w-full rounded-xl px-5 py-3 text-center text-sm"
    >
      Ödeme Adımına Geç
    </Link>
  );
}