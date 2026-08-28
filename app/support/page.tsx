import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SupportForm from "@/components/SupportForm";
import { prisma } from "@/lib/prisma";

function SupportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3z" />
      <path d="M17 19c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

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

function getStatusClass(status: string) {
  switch (status) {
    case "OPEN":
      return "status-warning";

    case "IN_PROGRESS":
      return "status-info";

    case "RESOLVED":
      return "status-success";

    case "REJECTED":
      return "status-danger";

    default:
      return "status-neutral";
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

      <main className="page-shell">
        <section className="page-section page-content max-w-6xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Destek
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Desteğe Bağlanın
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-text-soft">
              Sorununuzu veya talebinizi bize iletin. Destek
              ekibimiz talebinizi inceleyip bu ekran üzerinden
              yanıtlayacaktır.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="panel h-fit p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft">
                Yeni Talep
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                Destek Talebi Oluştur
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-soft">
                Talebinizi mümkün olduğunca açık şekilde yazın.
                Böylece destek ekibi size daha hızlı yardımcı
                olabilir.
              </p>

              <SupportForm />
            </div>

            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft">
                  Geçmiş
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-text">
                  Destek Taleplerim
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-soft">
                  Daha önce gönderdiğiniz talepleri ve verilen
                  cevapları buradan takip edebilirsiniz.
                </p>
              </div>

              {tickets.length === 0 ? (
                <div className="empty-state px-6 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                    <SupportIcon />
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-semibold text-text">
                    Henüz destek talebiniz yok
                  </h3>

                  <p className="mt-2 text-sm text-text-soft">
                    Oluşturduğunuz destek talepleri burada
                    görüntülenecek.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                    >
                      <div className="border-b border-border p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft">
                              {getCategoryLabel(
                                ticket.category,
                              )}
                            </p>

                            <h3 className="mt-2 font-serif text-xl font-semibold text-text">
                              {ticket.subject}
                            </h3>

                            <p className="mt-2 text-sm text-text-muted">
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

                          <span
                            className={`${getStatusClass(
                              ticket.status,
                            )} inline-flex rounded-full px-3 py-1.5 text-xs font-semibold`}
                          >
                            {getStatusLabel(
                              ticket.status,
                            )}
                          </span>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
                          <p className="leading-7 text-text-soft">
                            {ticket.message}
                          </p>
                        </div>
                      </div>

                      {ticket.replies.length > 0 ? (
                        <div className="bg-surface-soft p-6">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-text">
                              Destek Yanıtları
                            </p>

                            <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold text-brand">
                              {ticket.replies.length} yanıt
                            </span>
                          </div>

                          <div className="space-y-4">
                            {ticket.replies.map(
                              (reply) => (
                                <div
                                  key={reply.id}
                                  className="rounded-2xl border border-border bg-surface p-5"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-brand">
                                      {reply.admin.name ??
                                        "AMİRZAK Destek"}
                                    </p>

                                    <p className="text-xs text-text-muted">
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

                                  <p className="mt-3 leading-7 text-text-soft">
                                    {reply.message}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-surface-soft p-6">
                          <p className="text-sm text-text-muted">
                            Bu talebe henüz destek ekibi
                            tarafından yanıt verilmedi.
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