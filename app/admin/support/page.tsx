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

    case "REJECTED":
      return "Reddedildi";

    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "OPEN":
      return "text-red-400";

    case "IN_PROGRESS":
      return "text-yellow-400";

    case "RESOLVED":
      return "text-green-400";

    case "REJECTED":
      return "text-red-400";

    default:
      return "text-zinc-400";
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
              email: true,
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
        <section className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              Destek
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Destek Merkezi
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-400">
              Yeni bir destek talebi oluşturabilir ve daha önce
              gönderdiğiniz taleplerin durumunu takip edebilirsiniz.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SupportForm />
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Destek Taleplerim
                </h2>

                <p className="mt-2 text-zinc-400">
                  Gönderdiğiniz talepler ve destek ekibinin
                  yanıtları burada görüntülenir.
                </p>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                  <h3 className="text-xl font-bold">
                    Henüz destek talebiniz yok
                  </h3>

                  <p className="mt-3 text-zinc-400">
                    İlk destek talebinizi soldaki formdan
                    oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >
                      <div className="border-b border-zinc-800 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-red-400">
                              {getCategoryLabel(ticket.category)}
                            </p>

                            <h3 className="mt-2 text-xl font-bold">
                              {ticket.subject}
                            </h3>
                          </div>

                          <div className="text-right">
                            <p
                              className={`font-semibold ${getStatusColor(
                                ticket.status,
                              )}`}
                            >
                              {getStatusLabel(ticket.status)}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
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
                        </div>

                        <p className="mt-5 leading-7 text-zinc-300">
                          {ticket.message}
                        </p>
                      </div>

                      {ticket.replies.length > 0 ? (
                        <div className="bg-zinc-950/40 p-6">
                          <p className="mb-4 text-sm font-semibold text-zinc-400">
                            Destek Yanıtları
                          </p>

                          <div className="space-y-4">
                            {ticket.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                              >
                                <p className="font-semibold text-red-400">
                                  {reply.admin.name ??
                                    reply.admin.email ??
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
                        </div>
                      ) : (
                        <div className="bg-zinc-950/40 p-6">
                          <p className="text-sm text-zinc-500">
                            Destek ekibi henüz bu talebe yanıt vermedi.
                          </p>
                        </div>
                      )}

                      {ticket.status === "RESOLVED" && (
                        <div className="border-t border-zinc-800 bg-green-950/30 px-6 py-4">
                          <p className="text-sm font-semibold text-green-400">
                            Bu destek talebi çözüldü.
                          </p>
                        </div>
                      )}

                      {ticket.status === "REJECTED" && (
                        <div className="border-t border-zinc-800 bg-red-950/30 px-6 py-4">
                          <p className="text-sm font-semibold text-red-400">
                            Bu destek talebi reddedildi.
                          </p>
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