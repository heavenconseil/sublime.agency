import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
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
      <body className={`antialiased ${ibmPlexMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
