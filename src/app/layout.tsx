import type { Metadata, Viewport } from "next";
import { SALONE } from "@/lib/data/salon";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SALONE.nome} — Centro estetico alla Garbatella`,
    template: `%s · ${SALONE.nome}`,
  },
  description:
    "Semipermanente, semigel, ricostruzione, ceretta e viso a Roma Garbatella. " +
    "Prenoti scegliendo l'operatrice e sai quanto spendi prima di entrare.",
  openGraph: {
    title: `${SALONE.nome} — ${SALONE.quartiere}, Roma`,
    description: "Prenota il tuo trattamento in due minuti.",
    images: ["/images/og.webp"],
    locale: "it_IT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f3eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1719" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
