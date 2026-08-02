import type { Metadata } from "next";
import { Inter, League_Spartan, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "800"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwritten",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HeartNote — Handcrafted Digital Letter Gifts",
  description: "Create personalized, high-fidelity digital gift letters with polaroid photos, emotional messages, and a beautiful opening experience.",
  openGraph: {
    title: "HeartNote — Handcrafted Digital Letter Gifts",
    description: "Create personalized, high-fidelity digital gift letters with polaroid photos, emotional messages, and a beautiful opening experience.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${leagueSpartan.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col dotted-bg text-[#171717]">
        {children}
        <Analytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1070624128374789"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

