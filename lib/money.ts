import type { Prisma } from "@/app/generated/prisma/client";

export type MoneyValue =
  | Prisma.Decimal
  | number
  | string;

export function moneyToNumber(
  value: MoneyValue,
): number {
  return Number(value);
}

export function optionalMoneyToNumber(
  value: MoneyValue | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

export function formatMoney(
  value: MoneyValue,
): string {
  return Number(value).toLocaleString(
    "tr-TR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}