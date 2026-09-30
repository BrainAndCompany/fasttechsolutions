import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/branding";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.shortName} Careers`,
    template: `%s — ${BRAND.shortName} Careers`,
  },
  description:
    "Open positions and application tracking for Fast Tech Solutions.",
  icons: {
    icon: [{ url: "/logos/fts-icon.png", type: "image/png" }],
    apple: [{ url: "/logos/fts-icon.png", type: "image/png" }],
    shortcut: ["/logos/fts-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-mist text-ink">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mt-auto bg-teal text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-white/80 sm:px-6">
            <p>
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <p>Established 2018 · Riyadh, Kingdom of Saudi Arabia</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
