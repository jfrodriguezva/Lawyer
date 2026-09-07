import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "EC Abogados | Portal de Casos",
  description:
    "Portal de gestión de casos de la Lic. Erika Cruz García, EC Abogados.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${cormorant.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full bg-brand-ink font-sans text-brand-cream antialiased">
        {children}
      </body>
    </html>
  );
}
