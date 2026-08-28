import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProfileEditForm from "@/components/ProfileEditForm";
import { prisma } from "@/lib/prisma";

export default async function ProfileEditPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneCountryCode: true,
      phone: true,
      countryCode: true,
      city: true,
      postalCode: true,
      address: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-5xl">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-soft transition hover:text-brand"
          >
            ← Profilime Dön
          </Link>

          <div className="panel mt-7 p-6 sm:p-8">
            <div className="mb-7 border-b border-border pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-soft">
                Profil Bilgilerim
              </p>

              <h1 className="display-title mt-2 text-3xl text-brand sm:text-4xl">
                Bilgilerimi Düzenle
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-soft">
                Kişisel, iletişim ve teslimat bilgilerinizi
                buradan güncelleyebilirsiniz.
              </p>
            </div>

            <ProfileEditForm
              currentFirstName={
                user.firstName ?? user.name
              }
              currentLastName={user.lastName}
              currentEmail={user.email}
              currentPhoneCountryCode={
                user.phoneCountryCode
              }
              currentPhone={user.phone}
              currentCountryCode={
                user.countryCode
              }
              currentCity={user.city}
              currentPostalCode={
                user.postalCode
              }
              currentAddress={user.address}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}