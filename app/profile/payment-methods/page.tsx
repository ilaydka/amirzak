import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "@/lib/payment-method-actions";
import { prisma } from "@/lib/prisma";

function getCardBrandLabel(brand: string) {
  switch (brand) {
    case "VISA":
      return "Visa";

    case "MASTERCARD":
      return "Mastercard";

    case "TROY":
      return "TROY";

    case "AMEX":
      return "American Express";

    default:
      return "Kart";
  }
}

export default async function PaymentMethodsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const paymentMethods =
    await prisma.paymentMethod.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <section className="page-section page-content max-w-5xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
              Hesabım
            </p>

            <h1 className="display-title mt-2 text-4xl text-brand sm:text-5xl">
              Kayıtlı Kartlarım
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-text-soft">
              Alışveriş sırasında kullanacağınız ödeme
              yöntemlerini buradan yönetebilirsiniz.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h2 className="mb-4 font-serif text-xl font-semibold text-brand">
                Kartlarınız
              </h2>

              {paymentMethods.length === 0 ? (
                <div className="empty-state p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="M3 10h18" />
                    </svg>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-text">
                    Henüz kayıtlı kartınız yok
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-text-soft">
                    Yeni bir ödeme yöntemi eklediğinizde
                    burada görüntülenecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((card) => (
                    <article
                      key={card.id}
                      className="panel p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-pale text-brand">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="5"
                                width="18"
                                height="14"
                                rx="2"
                              />

                              <path d="M3 10h18" />
                            </svg>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-text">
                                {getCardBrandLabel(
                                  card.cardBrand,
                                )}{" "}
                                •••• {card.last4}
                              </p>

                              {card.isDefault && (
                                <span className="status-success rounded-full px-2.5 py-1 text-[11px] font-semibold">
                                  Varsayılan
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-text-soft">
                              {card.cardHolder}
                            </p>

                            <p className="mt-1 text-xs text-text-muted">
                              Son kullanma:{" "}
                              {String(
                                card.expiryMonth,
                              ).padStart(
                                2,
                                "0",
                              )}
                              /{card.expiryYear}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                        {!card.isDefault && (
                          <form
                            action={
                              setDefaultPaymentMethod
                            }
                          >
                            <input
                              type="hidden"
                              name="paymentMethodId"
                              value={card.id}
                            />

                            <button
                              type="submit"
                              className="secondary-button min-h-9 px-4 py-2 text-xs"
                            >
                              Varsayılan Yap
                            </button>
                          </form>
                        )}

                        <form
                          action={
                            deletePaymentMethod
                          }
                        >
                          <input
                            type="hidden"
                            name="paymentMethodId"
                            value={card.id}
                          />

                          <button
                            type="submit"
                            className="danger-button min-h-9 px-4 py-2 text-xs !text-white"
                          >
                            Kartı Sil
                          </button>
                        </form>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="panel h-fit p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
                Ödeme Yöntemi
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-brand">
                Yeni Kart Ekle
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-soft">
                Demo ödeme sistemi için kartın yalnızca
                görüntüleme bilgileri kaydedilir.
              </p>

              <form
                action={addPaymentMethod}
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="cardHolder"
                    className="mb-2 block text-sm font-semibold text-text-soft"
                  >
                    Kart Üzerindeki İsim
                  </label>

                  <input
                    id="cardHolder"
                    name="cardHolder"
                    required
                    autoComplete="cc-name"
                    placeholder="Ad Soyad"
                    className="field px-4 py-3 text-sm placeholder:text-text-muted"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cardBrand"
                    className="mb-2 block text-sm font-semibold text-text-soft"
                  >
                    Kart Türü
                  </label>

                  <select
                    id="cardBrand"
                    name="cardBrand"
                    required
                    className="field px-4 py-3 text-sm"
                  >
                    <option value="VISA">
                      Visa
                    </option>

                    <option value="MASTERCARD">
                      Mastercard
                    </option>

                    <option value="TROY">
                      TROY
                    </option>

                    <option value="AMEX">
                      American Express
                    </option>

                    <option value="OTHER">
                      Diğer
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="last4"
                    className="mb-2 block text-sm font-semibold text-text-soft"
                  >
                    Kartın Son 4 Hanesi
                  </label>

                  <input
                    id="last4"
                    name="last4"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    autoComplete="off"
                    placeholder="4242"
                    className="field px-4 py-3 text-sm placeholder:text-text-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="expiryMonth"
                      className="mb-2 block text-sm font-semibold text-text-soft"
                    >
                      Ay
                    </label>

                    <input
                      id="expiryMonth"
                      name="expiryMonth"
                      type="number"
                      required
                      min={1}
                      max={12}
                      placeholder="08"
                      className="field px-4 py-3 text-sm placeholder:text-text-muted"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="expiryYear"
                      className="mb-2 block text-sm font-semibold text-text-soft"
                    >
                      Yıl
                    </label>

                    <input
                      id="expiryYear"
                      name="expiryYear"
                      type="number"
                      required
                      min={new Date().getFullYear()}
                      placeholder="2029"
                      className="field px-4 py-3 text-sm placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="brand-button min-h-12 w-full px-5 py-3 text-sm"
                >
                  Kartı Kaydet
                </button>
              </form>

              <p className="mt-5 text-xs leading-5 text-text-muted">
                CVV veya tam kart numarası AMİRZAK
                veritabanında saklanmaz.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}