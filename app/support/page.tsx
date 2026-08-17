import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SupportForm from "@/components/SupportForm";
import { prisma } from "@/lib/prisma";

function getStatusLabel(status: string) {
  switch (status) {
    case "OPEN":
      return "Açık";

    case "IN_PROGRESS":
      return "İnceleniyor";

    case "RESOLVED":
      return "Çözüldü";

    case "CLOSED":
      return "Kapatıldı";

    default:
      return status;
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "ORDER":
      return "Sipariş";

    case "PRODUCT":
      return "Ürün";

    case "PAYMENT":
      return "Ödeme";

    case "ACCOUNT":
      return "Hesap";

    case "TECHNICAL":
      return "Teknik Sorun";

    default:
      return "Diğer";
  }
}

export default async function SupportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      replies: {
        include: {
          admin: {
            select: {
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Destek
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Desteğe Bağlanın
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Sorununuzu veya talebinizi bize iletin.
              Destek ekibimiz talebinizi inceleyip bu ekran
              üzerinden yanıtlayacaktır.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <SupportForm />

            <div>
              <h2 className="text-2xl font-bold">
                Destek Taleplerim
              </h2>

              <p className="mt-2 text-zinc-400">
                Daha önce gönderdiğiniz talepleri ve
                verilen cevapları buradan takip edebilirsiniz.
              </p>

              {tickets.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
                  <p className="text-zinc-400">
                    Henüz bir destek talebiniz bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >
                      <div className="border-b border-zinc-800 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-red-400">
                              {getCategoryLabel(
                                ticket.category,
                              )}
                            </p>

                            <h3 className="mt-2 text-xl font-bold">
                              {ticket.subject}
                            </h3>

                            <p className="mt-2 text-sm text-zinc-500">
                              {ticket.createdAt.toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>

                          <p className="rounded-full border border-zinc-700 px-3 py-1 text-sm font-semibold text-zinc-300">
                            {getStatusLabel(
                              ticket.status,
                            )}
                          </p>
                        </div>

                        <p className="mt-5 leading-7 text-zinc-300">
                          {ticket.message}
                        </p>
                      </div>

                      {ticket.replies.length > 0 && (
                        <div className="space-y-4 bg-zinc-950/40 p-6">
                          <p className="text-sm font-semibold text-zinc-400">
                            Destek Yanıtları
                          </p>

                          {ticket.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                            >
                              <p className="text-sm font-semibold text-red-400">
                                {reply.admin.name ??
                                  "AMİRZAK Destek"}
                              </p>

                              <p className="mt-2 leading-7 text-zinc-300">
                                {reply.message}
                              </p>

                              <p className="mt-3 text-xs text-zinc-600">
                                {reply.createdAt.toLocaleDateString(
                                  "tr-TR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}