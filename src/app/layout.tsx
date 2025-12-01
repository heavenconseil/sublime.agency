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
  description: "Premium AI Studio - Premium Award-winning AI Studio",
  openGraph: {
    title: "Sublime Agency",
    description: "Premium AI Studio - Premium Award-winning AI Studio",
    url: "https://sublime.agency",
    siteName: "Sublime Agency",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sublime Agency - Premium Award-winning AI Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sublime Agency",
    description: "Premium AI Studio - Premium Award-winning AI Studio",
    images: ["/og-image.png"],
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
