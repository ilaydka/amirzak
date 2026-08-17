import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProfileEditForm from "@/components/ProfileEditForm";
import { prisma } from "@/lib/prisma";

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Yönetici";

    case "DEALER":
      return "Satıcı";

    default:
      return "Kullanıcı";
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
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
        role: true,
        createdAt: true,
      },
    });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Hesabım
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Profilim
            </h1>

            <p className="mt-3 text-zinc-400">
              Kişisel, iletişim ve adres bilgilerinizi
              buradan güncelleyebilirsiniz.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Kişisel Bilgiler
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  Hesap ve sipariş işlemlerinde kullanılacak
                  bilgilerinizi düzenleyebilirsiniz.
                </p>
              </div>

              <ProfileEditForm
                currentFirstName={
                  user.firstName ??
                  user.name
                }
                currentLastName={
                  user.lastName
                }
                currentEmail={
                  user.email
                }
                currentPhoneCountryCode={
                  user.phoneCountryCode
                }
                currentPhone={
                  user.phone
                }
                currentCountryCode={
                  user.countryCode
                }
                currentCity={
                  user.city
                }
                currentPostalCode={
                  user.postalCode
                }
                currentAddress={
                  user.address
                }
              />
            </div>

            <aside className="h-fit overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 p-6">
                <p className="text-sm text-zinc-500">
                  Hesap Türü
                </p>

                <p className="mt-2 font-semibold">
                  {getRoleLabel(
                    user.role,
                  )}
                </p>
              </div>

              <div className="p-6">
                <p className="text-sm text-zinc-500">
                  Üyelik Tarihi
                </p>

                <p className="mt-2 font-semibold">
                  {user.createdAt.toLocaleDateString(
                    "tr-TR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}