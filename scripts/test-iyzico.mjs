import crypto from "node:crypto";

const apiKey = process.env.IYZICO_API_KEY;
const secretKey = process.env.IYZICO_SECRET_KEY;
const baseUrl = process.env.IYZICO_BASE_URL;

if (!apiKey || !secretKey || !baseUrl) {
  console.error("IYZICO env değişkenleri eksik.");
  process.exit(1);
}

const uri = "/payment/iyzipos/checkoutform/initialize/auth/ecom";

const body = JSON.stringify({
  locale: "tr",
  conversationId: `test-${Date.now()}`,
  price: "1.00",
  paidPrice: "1.00",
  currency: "TRY",
  basketId: `basket-${Date.now()}`,
  paymentGroup: "PRODUCT",
  callbackUrl: "http://localhost:3000/api/iyzico/callback",
  enabledInstallments: [1],
  buyer: {
    id: "test-user",
    name: "Test",
    surname: "User",
    gsmNumber: "+905555555555",
    email: "test@example.com",
    identityNumber: "11111111111",
    lastLoginDate: "2026-08-22 12:00:00",
    registrationDate: "2026-08-22 12:00:00",
    registrationAddress: "Test Address",
    ip: "127.0.0.1",
    city: "Istanbul",
    country: "Turkey",
    zipCode: "34000",
  },
  shippingAddress: {
    contactName: "Test User",
    city: "Istanbul",
    country: "Turkey",
    address: "Test Address",
    zipCode: "34000",
  },
  billingAddress: {
    contactName: "Test User",
    city: "Istanbul",
    country: "Turkey",
    address: "Test Address",
    zipCode: "34000",
  },
  basketItems: [
    {
      id: "1",
      name: "Test Product",
      category1: "Test",
      itemType: "PHYSICAL",
      price: "1.00",
    },
  ],
});

const randomKey = crypto.randomUUID();

const payload =
  randomKey +
  uri +
  body;

const signature = crypto
  .createHmac("sha256", secretKey)
  .update(payload)
  .digest("hex");

const authorizationString =
  `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;

const authorization =
  "IYZWSv2 " +
  Buffer.from(authorizationString).toString("base64");

const response = await fetch(
  `${baseUrl}${uri}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      "x-iyzi-rnd": randomKey,
    },
    body,
  },
);

const result = await response.json();

console.log({
  status: result.status,
  errorCode: result.errorCode,
  errorMessage: result.errorMessage,
  tokenReceived: Boolean(result.token),
  paymentPageUrlReceived: Boolean(
    result.paymentPageUrl,
  ),
});