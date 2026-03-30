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
  metadataBase: new URL("https://sublime.agency"),
  title: "Sublime Agency — Premium Award-winning AI Studio",
  description:
    "Sublime is a 100% AI-powered creative studio by heaven. We craft generative campaigns, conversational bots, and AI tools for global brands like Motorola, Saint-Gobain, and Adobe.",
  keywords: [
    "AI studio",
    "generative AI",
    "AI campaigns",
    "AI creative agency",
    "conversational bots",
    "AI tools",
    "heaven agency",
    "Sublime Agency",
    "intelligence artificielle",
    "studio IA",
  ],
  authors: [{ name: "Sublime Agency", url: "https://sublime.agency" }],
  creator: "Sublime Agency",
  publisher: "heaven (Groupe Hopscotch)",
  openGraph: {
    title: "Sublime Agency — Premium Award-winning AI Studio",
    description:
      "100% AI-powered creative studio. Generative campaigns, conversational bots, and AI platforms for global brands.",
    url: "https://sublime.agency",
    siteName: "Sublime Agency",
    locale: "fr_FR",
    alternateLocale: ["en_US", "es_ES", "de_DE", "ko_KR", "zh_CN", "ar_SA"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sublime Agency — Premium Award-winning AI Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sublime Agency — Premium Award-winning AI Studio",
    description:
      "100% AI-powered creative studio. Generative campaigns, conversational bots, and AI platforms for global brands.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://sublime.agency",
    languages: {
      "fr": "https://sublime.agency",
      "en": "https://sublime.agency",
      "es": "https://sublime.agency",
      "de": "https://sublime.agency",
      "ko": "https://sublime.agency",
      "zh": "https://sublime.agency",
      "ar": "https://sublime.agency",
      "x-default": "https://sublime.agency",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sublime Agency",
  description:
    "100% AI-powered creative studio by heaven (Groupe Hopscotch). Generative campaigns, conversational bots, and AI platforms.",
  url: "https://sublime.agency",
  logo: "https://sublime.agency/sublimeV1.svg",
  email: "sublime@heaven.fr",
  foundingDate: "2024",
  parentOrganization: {
    "@type": "Organization",
    name: "heaven",
    url: "https://heaven.paris",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paris",
    addressCountry: "FR",
  },
  knowsLanguage: ["fr", "en", "es", "de", "ko", "zh", "ar"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Generative Campaigns",
          description:
            "AI-driven creative campaigns with dynamic visual and audio generation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Conversational Bots",
          description:
            "Intelligent conversational agents tailored to brand identity",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI Tools and Platforms",
          description:
            "Strategic AI integration and custom platforms for businesses",
        },
      },
    ],
  },
  award: [
    "Grand Prix de la Creativite IA & Data 2025",
    "Best Social Media Operation — Grand Prix IA & Data 2025",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`antialiased ${ibmPlexMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
