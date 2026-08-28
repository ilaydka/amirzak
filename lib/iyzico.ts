import crypto from "node:crypto";

function getRequiredEnv(
  name: string,
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} bulunamadı.`,
    );
  }

  return value;
}

const apiKey =
  getRequiredEnv(
    "IYZICO_API_KEY",
  );

const secretKey =
  getRequiredEnv(
    "IYZICO_SECRET_KEY",
  );

const baseUrl =
  getRequiredEnv(
    "IYZICO_BASE_URL",
  );

type IyzicoBuyer = {
  id: string;
  name: string;
  surname: string;
  gsmNumber: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  ip: string;
  city: string;
  country: string;
  zipCode?: string;
};

type IyzicoAddress = {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
};

type IyzicoBasketItem = {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType:
    | "PHYSICAL"
    | "VIRTUAL";
  price: string;
};

export type InitializeCheckoutFormInput = {
  conversationId: string;
  price: string;
  paidPrice: string;
  basketId: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
};

export type InitializeCheckoutFormResult = {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  paymentPageUrl?: string;
};

export type RetrieveCheckoutFormResult = {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  price?: number;
  paidPrice?: number;
  installment?: number;
  paymentId?: string;
  paymentStatus?: string;
  fraudStatus?: number;
  currency?: string;
  basketId?: string;
  token?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardType?: string;
  cardToken?: string;
  cardUserKey?: string;
};

export type RefundPaymentInput = {
  paymentId: string;
  price: string;
  conversationId: string;
  ip?: string;
};

export type RefundPaymentResult = {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  paymentId?: string;
  price?: number;
  currency?: string;
  authCode?: string;
  hostReference?: string;
  refundHostReference?: string;
  retryable?: boolean;
  signature?: string;
};

function createAuthorization(
  uri: string,
  body: string,
) {
  const randomKey =
    crypto.randomUUID();

  const payload =
    randomKey +
    uri +
    body;

  const signature =
    crypto
      .createHmac(
        "sha256",
        secretKey,
      )
      .update(payload)
      .digest("hex");

  const authorizationString =
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;

  const authorization =
    "IYZWSv2 " +
    Buffer.from(
      authorizationString,
    ).toString("base64");

  return {
    authorization,
    randomKey,
  };
}

async function sendIyzicoRequest<T>(
  uri: string,
  data: unknown,
): Promise<T> {
  const body =
    JSON.stringify(data);

  const {
    authorization,
    randomKey,
  } = createAuthorization(
    uri,
    body,
  );

  const response =
    await fetch(
      `${baseUrl}${uri}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            authorization,
          "x-iyzi-rnd":
            randomKey,
        },
        body,
        cache: "no-store",
      },
    );

  const result =
    (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      `iyzico HTTP hatası: ${response.status}`,
    );
  }

  return result;
}

export async function initializeCheckoutForm(
  input: InitializeCheckoutFormInput,
) {
  const uri =
    "/payment/iyzipos/checkoutform/initialize/auth/ecom";

  return sendIyzicoRequest<InitializeCheckoutFormResult>(
    uri,
    {
      locale: "tr",
      conversationId:
        input.conversationId,
      price:
        input.price,
      paidPrice:
        input.paidPrice,
      currency: "TRY",
      basketId:
        input.basketId,
      paymentGroup:
        "PRODUCT",
      callbackUrl:
        input.callbackUrl,
      enabledInstallments: [
        1,
        2,
        3,
        6,
        9,
      ],
      buyer:
        input.buyer,
      shippingAddress:
        input.shippingAddress,
      billingAddress:
        input.billingAddress,
      basketItems:
        input.basketItems,
    },
  );
}

export async function retrieveCheckoutForm(
  token: string,
  conversationId: string,
) {
  const uri =
    "/payment/iyzipos/checkoutform/auth/ecom/detail";

  return sendIyzicoRequest<RetrieveCheckoutFormResult>(
    uri,
    {
      locale: "tr",
      conversationId,
      token,
    },
  );
}

export async function refundPayment(
  input: RefundPaymentInput,
) {
  const uri =
    "/v2/payment/refund";

  return sendIyzicoRequest<RefundPaymentResult>(
    uri,
    {
      locale: "tr",
      conversationId:
        input.conversationId,
      paymentId:
        input.paymentId,
      price:
        input.price,
      currency: "TRY",
      ...(input.ip
        ? {
            ip: input.ip,
          }
        : {}),
    },
  );
}