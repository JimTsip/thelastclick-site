import type { Metadata } from "next";
import { Geist, Geist_Mono, Jersey_10 } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

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
  title: "The Last Click — AI First. Bold Ideas.",
  description: "We turn ambitious ideas into AI-powered products that actually work.",
  icons: {
    icon: "/TLC-logo.png",
    shortcut: "/TLC-logo.png",
    apple: "/TLC-logo.png",
  },
  openGraph: {
    title: "The Last Click",
    description: "AI First. Bold Ideas. One Last Click.",
    url: "https://thelastclick.gr",
    siteName: "The Last Click",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${jersey.variable}`}>{children}</body>
    </html>
  );
}
