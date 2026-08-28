import type { Metadata } from "next";
import {
  Geist,
  Playfair_Display,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AMİRZAK",
    template: "%s | AMİRZAK",
  },
  description:
    "AMİRZAK online alışveriş platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}