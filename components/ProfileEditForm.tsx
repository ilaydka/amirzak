"use client";

import {
  useActionState,
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

  const initialPhoneCountry =
    countries.find((country) => {
      const phoneCode = `+${country.phonecode.replace(
        "+",
        "",
      )}`;

      return (
        phoneCode ===
        (currentPhoneCountryCode ?? "+90")
      );
    }) ??
    countries.find(
      (country) =>
        country.isoCode === "TR",
    );

  const [phoneCountryIso, setPhoneCountryIso] =
    useState(
      initialPhoneCountry?.isoCode ?? "TR",
    );

  const [phone, setPhone] = useState(
    currentPhone ?? "",
  );

  const [countryCode, setCountryCode] =
    useState(
      currentCountryCode ?? "TR",
    );

  const [city, setCity] = useState(
    currentCity ?? "",
  );

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
    setPhoneCountryIso(
      event.target.value,
    );

    setPhone("");
  }

  function handlePhoneChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue =
      event.target.value;

    try {
      const formatter = new AsYouType(
        phoneCountryIso as CountryCode,
      );

      setPhone(
        formatter.input(rawValue),
      );
    } catch {
      setPhone(rawValue);
    }
  }

  return (
    <form action={formAction}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-zinc-400"
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
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-zinc-400"
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
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
          />
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-400"
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
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-zinc-400"
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
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
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
            inputMode="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={
              handlePhoneChange
            }
            required
            placeholder={
              phonePlaceholder
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
          />
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Ülke kodunu tekrar yazmadan telefon
          numaranızı girin.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="countryCode"
          className="text-sm font-medium text-zinc-400"
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
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
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
          className="text-sm font-medium text-zinc-400"
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
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
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
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
          />
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="postalCode"
          className="text-sm font-medium text-zinc-400"
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
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="address"
          className="text-sm font-medium text-zinc-400"
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
          className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      </div>

      {state.message && (
        <p
          className={
            state.success
              ? "mt-5 rounded-lg border border-green-900 bg-green-950 p-4 text-sm text-green-300"
              : "mt-5 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Kaydediliyor..."
          : "Bilgilerimi Kaydet"}
      </button>
    </form>
  );
}