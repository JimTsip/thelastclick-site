import type { Metadata } from "next";
import { Geist, Jersey_10 } from "next/font/google";
import Script from "next/script";
import { GAMES, STUDIO_INSTAGRAM } from "./lib/games";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-TD0G3Z1MQ7";
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const jersey = Jersey_10({ variable: "--font-jersey", subsets: ["latin"], weight: "400" });
const title = "The Last Click — Independent Game Studio | BoomBoats, DADLINE & ShipDuel";
const description = "Meet The Last Click, the independent game studio behind BoomBoats, DADLINE: Family Rush and ShipDuel. Discover our games, see gameplay and follow what's next.";
export const metadata: Metadata = {
  metadataBase: new URL("https://thelastclick.ai"), title, description,
  keywords: ["The Last Click", "independent game studio", "game studio Greece", "BoomBoats", "DADLINE Family Rush", "ShipDuel", "mobile games", "naval strategy", "pirate games"],
  alternates: { canonical: "https://thelastclick.ai/" },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  openGraph: { title, description, url: "https://thelastclick.ai/", siteName: "The Last Click", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};
const organizationSchema = {
  "@context": "https://schema.org", "@type": "Organization", "@id": "https://thelastclick.ai/#org",
  name: "The Last Click", legalName: "THE LAST CLICK L.P.", vatID: "EL802801218", taxID: "802801218",
  identifier: { "@type": "PropertyValue", propertyID: "GEMI", value: "183032403000" },
  url: "https://thelastclick.ai/", logo: "https://thelastclick.ai/TLC-logo.png", image: "https://thelastclick.ai/opengraph-image.png",
  description: "Independent game studio based in Greece. Creators of BoomBoats, DADLINE: Family Rush and ShipDuel.",
  email: "hello@thelastclick.gr", foundingDate: "2026",
  founder: { "@type": "Person", name: "Jim Tsipoutas", url: "https://jimtsipoutas.com" },
  address: { "@type": "PostalAddress", streetAddress: "59-61 Agiou Konstantinou", addressLocality: "Maroussi", addressRegion: "Attiki", postalCode: "15124", addressCountry: "GR" },
  knowsAbout: ["game development", "mobile games", "game art", "game design"],
  sameAs: [STUDIO_INSTAGRAM, "https://www.linkedin.com/company/thelastclick"],
};
const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "@id": "https://thelastclick.ai/#website", name: "The Last Click", url: "https://thelastclick.ai/", inLanguage: "en", publisher: { "@id": "https://thelastclick.ai/#org" } };
const gameSchemas = GAMES.map((game) => ({
  "@context": "https://schema.org", "@type": "VideoGame", "@id": "https://thelastclick.ai/#" + game.id,
  name: game.name, description: game.description, url: "https://thelastclick.ai/#" + game.id,
  image: "https://thelastclick.ai" + game.art, creator: { "@id": "https://thelastclick.ai/#org" },
  ...(game.ios ? { operatingSystem: game.android ? ["iOS", "Android"] : ["iOS"], installUrl: game.android ? [game.ios, game.android] : [game.ios] } : {}),
}));
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${jersey.variable}`}>
    {children}
    {[organizationSchema, websiteSchema, ...gameSchemas].map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    <Script id="ga4" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_MEASUREMENT_ID}');`}</Script>
  </body></html>;
}
