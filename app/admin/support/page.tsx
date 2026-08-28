import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  replyToSupportTicket,
  updateSupportStatus,
} from "@/lib/admin-support-actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type AdminSupportPageProps = {
  searchParams: Promise<{
    replied?: string;
    replyError?: string;
    statusUpdated?: string;
    statusError?: string;
    view?: string;
    q?: string;
    category?: string;
    status?: string;
  }>;
};

type SupportView =
  | "waiting"
  | "answered";

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

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
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

function getNextStatuses(status: string) {
  switch (status) {
    case "OPEN":
      return [
        {
          value: "IN_PROGRESS",
          label: "İnceleniyor",
        },
        {
          value: "RESOLVED",
          label: "Çözüldü",
        },
        {
          value: "REJECTED",
          label: "Reddedildi",
        },
      ];

    case "IN_PROGRESS":
      return [
        {
          value: "RESOLVED",
          label: "Çözüldü",
        },
        {
          value: "REJECTED",
          label: "Reddedildi",
        },
      ];

    default:
      return [];
  }
}

function buildSupportUrl({
  view,
  q,
  category,
  status,
}: {
  view: SupportView;
  q?: string;
  category?: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  params.set("view", view);

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (category) {
    params.set("category", category);
  }

  if (status) {
    params.set("status", status);
  }

  return `/admin/support?${params.toString()}`;
}

export default async function AdminSupportPage({
  searchParams,
}: AdminSupportPageProps) {
  await requireAdmin();

  const {
    replied,
    replyError,
    statusUpdated,
    statusError,
    view,
    q,
    category,
    status,
  } = await searchParams;

  const activeView: SupportView =
    view === "answered"
      ? "answered"
      : "waiting";

  const searchQuery =
    q?.trim().toLocaleLowerCase(
      "tr-TR",
    ) ?? "";

  const tickets =
    await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        replies: {
          include: {
            admin: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
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

  const waitingTickets = tickets.filter(
    (ticket) =>
      ticket.replies.length === 0 &&
      ticket.status !== "RESOLVED" &&
      ticket.status !== "REJECTED",
  );

  const answeredTickets = tickets.filter(
    (ticket) =>
      ticket.replies.length > 0 ||
      ticket.status === "RESOLVED" ||
      ticket.status === "REJECTED",
  );

  const ticketsByView =
    activeView === "answered"
      ? answeredTickets
      : waitingTickets;

  const visibleTickets =
    ticketsByView.filter((ticket) => {
      const customerName = [
        ticket.user.firstName,
        ticket.user.lastName,
        ticket.user.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
          "tr-TR",
        );

      const customerEmail =
        ticket.user.email
          ?.toLocaleLowerCase(
            "tr-TR",
          ) ?? "";

      const searchableText = [
        ticket.id,
        ticket.subject,
        ticket.message,
        customerName,
        customerEmail,
        getCategoryLabel(
          ticket.category,
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
          "tr-TR",
        );

      const matchesSearch =
        !searchQuery ||
        searchableText.includes(
          searchQuery,
        );

      const matchesCategory =
        !category ||
        ticket.category === category;

      const matchesStatus =
        !status ||
        ticket.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(category) ||
    Boolean(status);

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-7xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Yönetim Paneli
            </p>

            <h1 className="display-title mt-3 text-4xl text-text sm:text-5xl">
              Destek Talepleri
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Yanıt bekleyen destek
              taleplerini yönetin,
              cevaplanan ve kapanan
              talepleri ayrı olarak
              inceleyin.
            </p>
          </div>

          {(replied === "1" ||
            statusUpdated === "1") && (
            <div className="status-success mb-5 rounded-2xl px-5 py-4 text-sm font-medium">
              {replied === "1"
                ? "Destek yanıtı başarıyla gönderildi."
                : "Talep durumu başarıyla güncellendi."}
            </div>
          )}

          {(replyError ||
            statusError) && (
            <div className="status-danger mb-5 rounded-2xl px-5 py-4 text-sm font-medium">
              İşlem gerçekleştirilemedi.
            </div>
          )}

          <div className="mb-7 overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm">
            <div className="flex gap-8 overflow-x-auto px-6 pt-5">
              <Link
                href={buildSupportUrl({
                  view: "waiting",
                  q,
                  category,
                  status,
                })}
                className={
                  activeView === "waiting"
                    ? "whitespace-nowrap border-b-2 border-brand pb-4 text-sm font-semibold text-brand"
                    : "whitespace-nowrap pb-4 text-sm font-semibold text-text-soft transition hover:text-brand"
                }
              >
                Cevap Bekleyenler

                <span className="ml-2 rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand">
                  {waitingTickets.length}
                </span>
              </Link>

              <Link
                href={buildSupportUrl({
                  view: "answered",
                  q,
                  category,
                  status,
                })}
                className={
                  activeView === "answered"
                    ? "whitespace-nowrap border-b-2 border-brand pb-4 text-sm font-semibold text-brand"
                    : "whitespace-nowrap pb-4 text-sm font-semibold text-text-soft transition hover:text-brand"
                }
              >
                Cevaplananlar

                <span className="ml-2 rounded-full bg-brand-pale px-2 py-0.5 text-xs text-brand">
                  {answeredTickets.length}
                </span>
              </Link>
            </div>
          </div>

          <section className="panel mb-7 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">
                  Arama ve Filtreleme
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-text">
                  Talepleri Bul
                </h2>
              </div>

              <p className="shrink-0 text-sm text-text-muted">
                {visibleTickets.length} /{" "}
                {ticketsByView.length} talep
              </p>
            </div>

            <form
              method="GET"
              action="/admin/support"
              className="mt-5 grid gap-3 xl:grid-cols-[minmax(280px,1.6fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_auto] xl:items-end"
            >
              <input
                type="hidden"
                name="view"
                value={activeView}
              />

              <div className="min-w-0">
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Ara
                </label>

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q ?? ""}
                  placeholder="Konu, kullanıcı, e-posta veya talep içeriği"
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Kategori
                </label>

                <select
                  id="category"
                  name="category"
                  defaultValue={
                    category ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tüm Kategoriler
                  </option>

                  <option value="ORDER">
                    Sipariş
                  </option>

                  <option value="PRODUCT">
                    Ürün
                  </option>

                  <option value="PAYMENT">
                    Ödeme
                  </option>

                  <option value="ACCOUNT">
                    Hesap
                  </option>

                  <option value="TECHNICAL">
                    Teknik Sorun
                  </option>

                  <option value="OTHER">
                    Diğer
                  </option>
                </select>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Talep Durumu
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={
                    status ?? ""
                  }
                  className="field w-full px-4 py-2.5 text-sm"
                >
                  <option value="">
                    Tüm Durumlar
                  </option>

                  <option value="OPEN">
                    Açık
                  </option>

                  <option value="IN_PROGRESS">
                    İnceleniyor
                  </option>

                  <option value="RESOLVED">
                    Çözüldü
                  </option>

                  <option value="REJECTED">
                    Reddedildi
                  </option>
                </select>
              </div>

              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Link
                    href={buildSupportUrl({
                      view: activeView,
                    })}
                    className="secondary-button flex min-h-11 items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm"
                  >
                    Temizle
                  </Link>
                )}

                <button
                  type="submit"
                  className="brand-button min-h-11 whitespace-nowrap px-5 py-2.5 text-sm"
                >
                  Filtrele
                </button>
              </div>
            </form>
          </section>

          {ticketsByView.length ===
          0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <SupportIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                {activeView ===
                "waiting"
                  ? "Yanıt bekleyen talep yok"
                  : "Cevaplanan talep yok"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-soft">
                {activeView ===
                "waiting"
                  ? "Yeni destek talepleri geldiğinde burada görüntülenecek."
                  : "Yanıtlanan veya kapatılan destek talepleri burada görüntülenecek."}
              </p>
            </div>
          ) : visibleTickets.length ===
            0 ? (
            <div className="empty-state flex min-h-[270px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-brand shadow-sm">
                <SearchIcon />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-text">
                Sonuç bulunamadı
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-soft">
                Arama kelimenizi veya
                seçtiğiniz filtreleri
                değiştirerek tekrar
                deneyebilirsiniz.
              </p>

              <Link
                href={buildSupportUrl({
                  view: activeView,
                })}
                className="secondary-button mt-5 px-5 py-3 text-sm"
              >
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleTickets.map(
                (ticket) => {
                  const customerName =
                    [
                      ticket.user
                        .firstName,
                      ticket.user
                        .lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    ticket.user.name ||
                    "İsimsiz Kullanıcı";

                  const isClosed =
                    ticket.status ===
                      "RESOLVED" ||
                    ticket.status ===
                      "REJECTED";

                  const nextStatuses =
                    getNextStatuses(
                      ticket.status,
                    );

                  return (
                    <article
                      key={ticket.id}
                      className="min-w-0 overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm"
                    >
                      <div className="min-w-0 p-6 sm:p-7">
                        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold text-brand">
                                {getCategoryLabel(
                                  ticket.category,
                                )}
                              </span>

                              <span
                                className={`${getStatusClass(
                                  ticket.status,
                                )} rounded-full px-3 py-1 text-xs font-semibold`}
                              >
                                {getStatusLabel(
                                  ticket.status,
                                )}
                              </span>

                              <span className="status-neutral rounded-full px-3 py-1 text-xs font-semibold">
                                {ticket
                                  .replies
                                  .length >
                                0
                                  ? `${ticket.replies.length} yanıt`
                                  : "Yanıt bekliyor"}
                              </span>
                            </div>

                            <h2 className="mt-4 break-words font-serif text-2xl font-semibold text-text">
                              {
                                ticket.subject
                              }
                            </h2>

                            <div className="mt-2 min-w-0 text-sm text-text-soft">
                              <p className="break-words">
                                {
                                  customerName
                                }
                              </p>

                              {ticket.user
                                .email && (
                                <p className="mt-1 break-all text-text-muted">
                                  {
                                    ticket
                                      .user
                                      .email
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="shrink-0 text-xs text-text-muted">
                            {ticket.createdAt.toLocaleDateString(
                              "tr-TR",
                              {
                                day: "2-digit",
                                month:
                                  "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              },
                            )}
                          </p>
                        </div>

                        <div className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-soft p-5">
                          <p className="whitespace-pre-wrap break-words leading-7 text-text-soft">
                            {
                              ticket.message
                            }
                          </p>
                        </div>

                        {ticket.replies
                          .length >
                          0 && (
                          <div className="mt-6 min-w-0">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-text">
                                Gönderilen
                                Yanıtlar
                              </p>

                              <span className="rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold text-brand">
                                {
                                  ticket
                                    .replies
                                    .length
                                }{" "}
                                yanıt
                              </span>
                            </div>

                            <div className="space-y-3">
                              {ticket.replies.map(
                                (
                                  reply,
                                ) => {
                                  const adminName =
                                    [
                                      reply
                                        .admin
                                        .firstName,
                                      reply
                                        .admin
                                        .lastName,
                                    ]
                                      .filter(
                                        Boolean,
                                      )
                                      .join(
                                        " ",
                                      ) ||
                                    reply
                                      .admin
                                      .name ||
                                    "AMİRZAK Destek";

                                  return (
                                    <div
                                      key={
                                        reply.id
                                      }
                                      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-soft p-5"
                                    >
                                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="min-w-0 break-words font-semibold text-brand">
                                          {
                                            adminName
                                          }
                                        </p>

                                        <p className="shrink-0 text-xs text-text-muted">
                                          {reply.createdAt.toLocaleDateString(
                                            "tr-TR",
                                            {
                                              day: "2-digit",
                                              month:
                                                "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute:
                                                "2-digit",
                                            },
                                          )}
                                        </p>
                                      </div>

                                      <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-text-soft">
                                        {
                                          reply.message
                                        }
                                      </p>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}

                        {!isClosed && (
                          <div className="mt-6 grid min-w-0 gap-5 border-t border-border pt-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                            <form
                              action={
                                replyToSupportTicket
                              }
                              className="min-w-0"
                            >
                              <input
                                type="hidden"
                                name="ticketId"
                                value={
                                  ticket.id
                                }
                              />

                              <label
                                htmlFor={`reply-${ticket.id}`}
                                className="text-sm font-semibold text-brand"
                              >
                                Destek
                                Yanıtı
                              </label>

                              <textarea
                                id={`reply-${ticket.id}`}
                                name="message"
                                rows={5}
                                required
                                maxLength={
                                  3000
                                }
                                placeholder="Kullanıcıya gönderilecek yanıtı yazın..."
                                className="field mt-2 w-full resize-y px-4 py-3 placeholder:text-text-muted"
                              />

                              <button
                                type="submit"
                                className="brand-button mt-3 px-6 py-3 text-sm"
                              >
                                Yanıt
                                Gönder
                              </button>
                            </form>

                            <div className="min-w-0 rounded-2xl border border-border bg-surface-soft p-5">
                              <p className="text-sm font-semibold text-text">
                                Talep Durumu
                              </p>

                              <p className="mt-1 text-xs leading-5 text-text-muted">
                                Talebin işlem
                                durumunu
                                güncelleyin.
                              </p>

                              {nextStatuses.length >
                              0 ? (
                                <form
                                  action={
                                    updateSupportStatus
                                  }
                                  className="mt-4 min-w-0 space-y-3"
                                >
                                  <input
                                    type="hidden"
                                    name="ticketId"
                                    value={
                                      ticket.id
                                    }
                                  />

                                  <select
                                    name="status"
                                    defaultValue=""
                                    required
                                    className="field w-full px-4 py-3 text-sm"
                                  >
                                    <option
                                      value=""
                                      disabled
                                    >
                                      Yeni durum
                                      seç
                                    </option>

                                    {nextStatuses.map(
                                      (
                                        nextStatus,
                                      ) => (
                                        <option
                                          key={
                                            nextStatus.value
                                          }
                                          value={
                                            nextStatus.value
                                          }
                                        >
                                          {
                                            nextStatus.label
                                          }
                                        </option>
                                      ),
                                    )}
                                  </select>

                                  <button
                                    type="submit"
                                    className="secondary-button w-full px-5 py-3 text-sm"
                                  >
                                    Durumu
                                    Güncelle
                                  </button>
                                </form>
                              ) : (
                                <p className="mt-4 text-sm text-text-soft">
                                  Bu talep
                                  kapatılmıştır.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {isClosed && (
                          <div className="mt-6 border-t border-border pt-5">
                            <p className="break-words text-sm text-text-muted">
                              Bu talep
                              kapatılmıştır ve
                              artık yanıt veya
                              durum değişikliği
                              yapılamaz.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}