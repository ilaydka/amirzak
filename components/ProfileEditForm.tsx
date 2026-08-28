"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Country,
  State,
} from "country-state-city";

import {
  AsYouType,
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js";

import examples from "libphonenumber-js/mobile/examples";

import {
  updateProfile,
  type ProfileState,
} from "@/lib/profile-actions";

const initialState: ProfileState = {
  success: false,
  message: "",
};

type ProfileEditFormProps = {
  currentFirstName: string | null;
  currentLastName: string | null;
  currentEmail: string | null;
  currentPhoneCountryCode: string | null;
  currentPhone: string | null;
  currentCountryCode: string | null;
  currentCity: string | null;
  currentPostalCode: string | null;
  currentAddress: string | null;
};

function getCountryName(
  isoCode: string,
  name: string,
) {
  if (isoCode === "TR") {
    return "Türkiye";
  }

  return name;
}

function cleanTurkeyPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("90")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

function formatPhoneForCountry(
  value: string,
  isoCode: string,
) {
  try {
    const rawValue =
      isoCode === "TR"
        ? cleanTurkeyPhone(value)
        : value.replace(/\D/g, "");

    const formatter = new AsYouType(
      isoCode as CountryCode,
    );

    return formatter.input(rawValue);
  } catch {
    return value;
  }
}

const inputClass =
  "field mt-2 px-4 py-3 placeholder:text-text-muted";

const selectClass =
  "field px-4 py-3";

const labelClass =
  "text-sm font-semibold text-text-soft";

export default function ProfileEditForm({
  currentFirstName,
  currentLastName,
  currentEmail,
  currentPhoneCountryCode,
  currentPhone,
  currentCountryCode,
  currentCity,
  currentPostalCode,
  currentAddress,
}: ProfileEditFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateProfile,
      initialState,
    );

  const countries = useMemo(
    () => Country.getAllCountries(),
    [],
  );

  function findPhoneCountryIso(
    phoneCountryCode: string | null,
  ) {
    if (
      !phoneCountryCode ||
      phoneCountryCode === "+90"
    ) {
      return "TR";
    }

    const matchedCountry =
      countries.find((country) => {
        const phoneCode = `+${country.phonecode.replace(
          "+",
          "",
        )}`;

        return phoneCode === phoneCountryCode;
      });

    return matchedCountry?.isoCode ?? "TR";
  }

  const initialPhoneCountryIso =
    findPhoneCountryIso(
      currentPhoneCountryCode,
    );

  const [phoneCountryIso, setPhoneCountryIso] =
    useState(
      initialPhoneCountryIso,
    );

  const [phone, setPhone] = useState(() =>
    formatPhoneForCountry(
      currentPhone ?? "",
      initialPhoneCountryIso,
    ),
  );

  const [countryCode, setCountryCode] =
    useState(
      currentCountryCode ?? "TR",
    );

  const [city, setCity] = useState(
    currentCity ?? "",
  );

  /*
    Kayıt başarılı olduğunda gerçek bir sayfa yenilemesi yapıyoruz.

    Bunun nedeni:
    - Veritabanına Türkiye doğru kaydediliyor.
    - Sayfayı elle yenilediğinde Türkiye doğru geliyor.
    - Sorun yalnızca kayıt sonrasında tarayıcıdaki eski form
      değerlerinin ekranda kalması.

    window.location.reload() ile temiz server verisi yeniden okunur.
  */
  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.reload();
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.success]);

  const regions = useMemo(() => {
    return (
      State.getStatesOfCountry(
        countryCode,
      ) ?? []
    );
  }, [countryCode]);

  const selectedPhoneCountry =
    countries.find(
      (country) =>
        country.isoCode ===
        phoneCountryIso,
    );

  const selectedPhoneCode =
    selectedPhoneCountry
      ? `+${selectedPhoneCountry.phonecode.replace(
          "+",
          "",
        )}`
      : "+90";

  const phonePlaceholder =
    useMemo(() => {
      if (phoneCountryIso === "TR") {
        return "532 123 45 67";
      }

      try {
        const example =
          getExampleNumber(
            phoneCountryIso as CountryCode,
            examples,
          );

        return (
          example?.formatNational() ??
          "Telefon numarası"
        );
      } catch {
        return "Telefon numarası";
      }
    }, [phoneCountryIso]);

  function handleCountryChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const newCountryCode =
      event.target.value;

    setCountryCode(newCountryCode);
    setCity("");
  }

  function handlePhoneCountryChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const newIsoCode =
      event.target.value;

    setPhoneCountryIso(newIsoCode);
    setPhone("");
  }

  function handlePhoneChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue =
      event.target.value;

    setPhone(
      formatPhoneForCountry(
        rawValue,
        phoneCountryIso,
      ),
    );
  }

  return (
    <form
      action={formAction}
      autoComplete="off"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className={labelClass}
          >
            Ad
          </label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={
              currentFirstName ?? ""
            }
            required
            placeholder="Adınız"
            autoComplete="given-name"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className={labelClass}
          >
            Soyad
          </label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={
              currentLastName ?? ""
            }
            required
            placeholder="Soyadınız"
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="email"
          className={labelClass}
        >
          E-posta
        </label>

        <input
          id="email"
          name="email"
          type="email"
          defaultValue={
            currentEmail ?? ""
          }
          required
          placeholder="ornek@email.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="phone"
          className={labelClass}
        >
          Telefon
        </label>

        <div className="mt-2 grid gap-3 md:grid-cols-[240px_1fr]">
          <select
            id="phoneCountryIso"
            value={phoneCountryIso}
            onChange={
              handlePhoneCountryChange
            }
            required
            autoComplete="off"
            className={selectClass}
          >
            {countries.map(
              (country) => {
                const phoneCode =
                  country.phonecode.replace(
                    "+",
                    "",
                  );

                return (
                  <option
                    key={
                      country.isoCode
                    }
                    value={
                      country.isoCode
                    }
                  >
                    {getCountryName(
                      country.isoCode,
                      country.name,
                    )}{" "}
                    (+{phoneCode})
                  </option>
                );
              },
            )}
          </select>

          <input
            type="hidden"
            name="phoneCountryCode"
            value={selectedPhoneCode}
          />

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            onChange={
              handlePhoneChange
            }
            required
            placeholder={
              phonePlaceholder
            }
            className={selectClass}
          />
        </div>

        <p className="mt-2 text-xs text-text-muted">
          {phoneCountryIso === "TR"
            ? "Türkiye için +90 ve baştaki 0'ı tekrar yazmayın. Örnek: 532 123 45 67"
            : "Ülke kodunu tekrar yazmadan telefon numaranızı girin."}
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="countryCode"
          className={labelClass}
        >
          Ülke
        </label>

        <select
          id="countryCode"
          name="countryCode"
          value={countryCode}
          onChange={
            handleCountryChange
          }
          required
          autoComplete="off"
          className={`mt-2 ${selectClass}`}
        >
          {countries.map(
            (country) => (
              <option
                key={country.isoCode}
                value={country.isoCode}
              >
                {getCountryName(
                  country.isoCode,
                  country.name,
                )}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="mt-5">
        <label
          htmlFor="city"
          className={labelClass}
        >
          Şehir / Eyalet / Bölge
        </label>

        {regions.length > 0 ? (
          <select
            id="city"
            name="city"
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value,
              )
            }
            required
            autoComplete="off"
            className={`mt-2 ${selectClass}`}
          >
            <option value="">
              Şehir / Eyalet / Bölge seçin
            </option>

            {regions.map(
              (region) => (
                <option
                  key={`${region.countryCode}-${region.isoCode}`}
                  value={region.name}
                >
                  {region.name}
                </option>
              ),
            )}
          </select>
        ) : (
          <input
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value,
              )
            }
            required
            placeholder="Şehir / Eyalet / Bölge"
            autoComplete="address-level1"
            className={inputClass}
          />
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="postalCode"
          className={labelClass}
        >
          Posta Kodu
        </label>

        <input
          id="postalCode"
          name="postalCode"
          type="text"
          defaultValue={
            currentPostalCode ?? ""
          }
          required
          placeholder="Posta kodu"
          autoComplete="postal-code"
          className={inputClass}
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="address"
          className={labelClass}
        >
          Adres
        </label>

        <textarea
          id="address"
          name="address"
          rows={5}
          defaultValue={
            currentAddress ?? ""
          }
          required
          placeholder="Mahalle, cadde, sokak, bina no, daire no ve diğer adres bilgileri"
          autoComplete="street-address"
          className="field mt-2 resize-y px-4 py-3 placeholder:text-text-muted"
        />
      </div>

      {state.message && (
        <div
          className={`mt-5 rounded-2xl p-4 text-sm font-medium ${
            state.success
              ? "status-success"
              : "status-danger"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="brand-button mt-6 min-h-12 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Kaydediliyor..."
          : "Bilgilerimi Kaydet"}
      </button>
    </form>
  );
}