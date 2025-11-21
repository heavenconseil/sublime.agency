import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Sublime Agency",
  description: "Premium AI Studio - Creative & Immersive Experiences",
  openGraph: {
    title: "Sublime Agency",
    description: "Premium AI Studio - Creative & Immersive Experiences",
    url: "https://sublime.agency",
    siteName: "Sublime Agency",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sublime Agency",
    description: "Premium AI Studio - Creative & Immersive Experiences",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
