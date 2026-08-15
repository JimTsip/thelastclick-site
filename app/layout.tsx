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
  title: "The Last Click — AI First. Bold Ideas.",
  description: "We turn ambitious ideas into AI-powered products that actually work.",
  // Icons and the OG image come from the app/ file conventions:
  // favicon.ico, icon.png, apple-icon.png, opengraph-image.png.
  openGraph: {
    title: "The Last Click",
    description: "AI First. Bold Ideas. One Last Click.",
    url: "https://thelastclick.gr",
    siteName: "The Last Click",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Last Click",
    description: "AI First. Bold Ideas. One Last Click.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Last Click",
  legalName: "THE LAST CLICK L.P.",
  url: "https://thelastclick.gr",
  logo: "https://thelastclick.gr/TLC-logo.png",
  description: "We turn ambitious ideas into AI-powered products that actually work.",
  email: "hello@thelastclick.gr",
  founder: { "@type": "Person", name: "Jim Tsipoutas", url: "https://jimtsipoutas.com" },
  address: { "@type": "PostalAddress", addressCountry: "GR" },
  sameAs: [
    "https://padlboard.ai",
    "https://boomboats.com",
    "https://cookonomics.com",
    "https://flexui.ai",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Last Click",
  url: "https://thelastclick.gr",
  publisher: { "@type": "Organization", name: "The Last Click" },
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
