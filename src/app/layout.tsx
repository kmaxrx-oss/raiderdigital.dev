import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raiderdigital.dev"),
  title: {
    default: "Raider Digital | Websites, Local SEO, and Workflows for Service Businesses",
    template: "%s · Raider Digital",
  },
  description:
    "Build a website and the digital systems around it — customer intake, discovery, and staff workflows. Start a project with Raider Digital.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/images/raider/favicon-mark.png" }],
  },
  openGraph: {
    title: "Raider Digital | Websites, Local SEO, and Workflows",
    description:
      "Websites and systems that help service businesses get customers and run work.",
    url: "https://raiderdigital.dev/",
    siteName: "Raider Digital",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
