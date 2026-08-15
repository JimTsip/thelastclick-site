import type { Metadata } from "next";
import { Geist, Jersey_10 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-TD0G3Z1MQ7";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jersey = Jersey_10({
  variable: "--font-jersey",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thelastclick.gr"),
  // The title is the one ranking signal we fully control. It has to say what
  // the studio does and where — nobody searches for a slogan.
  title: "The Last Click — AI-first product studio in Athens · AI products, apps, games & design systems",
  description:
    "The Last Click is an AI-first product studio in Athens. Bring us the work and we turn it into a live AI experience: AI products and agents, mobile apps and games, web apps and design systems — from brief to live.",
  keywords: [
    "AI product studio",
    "AI-first products",
    "AI agents",
    "AI voice agent",
    "mobile app development Athens",
    "game development Greece",
    "design system",
    "web app development",
    "The Last Click",
  ],
  alternates: { canonical: "https://thelastclick.gr/" },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  // Icons and the OG image come from the app/ file conventions:
  // favicon.ico, icon.png, apple-icon.png, opengraph-image.png.
  openGraph: {
    title: "The Last Click — AI-first product studio in Athens",
    description:
      "Bring us the work; we turn it into a live AI experience. AI products, apps, games and design systems — from brief to live.",
    url: "https://thelastclick.gr/",
    siteName: "The Last Click",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Last Click — AI-first product studio in Athens",
    description:
      "Bring us the work; we turn it into a live AI experience. AI products, apps, games and design systems — from brief to live.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": "https://thelastclick.gr/#org",
  name: "The Last Click",
  legalName: "THE LAST CLICK L.P.",
  url: "https://thelastclick.gr/",
  logo: "https://thelastclick.gr/TLC-logo.png",
  image: "https://thelastclick.gr/opengraph-image.png",
  description:
    "AI-first product studio in Athens. We turn briefs into live AI experiences: AI products and agents, mobile apps and games, web apps and design systems.",
  email: "hello@thelastclick.gr",
  foundingDate: "2026",
  founder: { "@type": "Person", name: "Jim Tsipoutas", url: "https://jimtsipoutas.com" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "59-61 Agiou Konstantinou",
    addressLocality: "Maroussi",
    addressRegion: "Attiki",
    postalCode: "15124",
    addressCountry: "GR",
  },
  areaServed: [{ "@type": "Country", name: "Greece" }, { "@type": "Place", name: "Europe" }, "Worldwide"],
  knowsAbout: [
    "artificial intelligence",
    "AI agents",
    "voice assistants",
    "mobile app development",
    "game development",
    "design systems",
    "product design",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "What we build",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI-first products and agents",
          description:
            "Voice agents, assistants, automations and the interfaces that make them feel inevitable — model, plumbing and judgment.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Mobile apps and games",
          description: "Native apps and games, from the first sketch to a passed review.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Web apps and design systems",
          description:
            "Interfaces that stay coherent as they grow, and the system underneath that keeps them that way.",
        },
      },
    ],
  },
  sameAs: [
    "https://www.linkedin.com/company/thelastclick",
    "https://padlboard.ai",
    "https://boomboats.com",
    "https://cookonomics.com",
    "https://flexui.ai",
    "https://jimtsipoutas.com",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://thelastclick.gr/#website",
  name: "The Last Click",
  url: "https://thelastclick.gr/",
  inLanguage: "en",
  publisher: { "@id": "https://thelastclick.gr/#org" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${jersey.variable}`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}</Script>
      </body>
    </html>
  );
}
