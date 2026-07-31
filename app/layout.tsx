import type { Metadata } from "next";
import { Geist_Mono, Jersey_10 } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jersey = Jersey_10({
  variable: "--font-jersey",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thelastclick.gr"),
  title: "The Last Click — Indie Games. Bold Ideas.",
  description: "The Last Click creates indie games with bold ideas and memorable worlds.",
  icons: {
    icon: "/TLC-logo.png",
    shortcut: "/TLC-logo.png",
    apple: "/TLC-logo.png",
  },
  openGraph: {
    title: "The Last Click",
    description: "Indie Games. Bold Ideas. One Last Click.",
    url: "https://thelastclick.gr",
    siteName: "The Last Click",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} ${jersey.variable}`}>{children}</body>
    </html>
  );
}
