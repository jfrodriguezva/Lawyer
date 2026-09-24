import type { Metadata } from "next";
import Script from "next/script";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  // El <title> es la señal más fuerte que usa Google para decidir si una página
  // responde a una búsqueda. Quien busca a la abogada la busca por su nombre
  // ("Erika Cruz García abogada", "Erika abogados"...), no por la marca
  // "ECGAbogados" -- así que el nombre completo va primero, la marca queda
  // como contexto secundario.
  title: {
    default: "Lic. Erika Cruz García | Abogada de derecho familiar — ECGAbogados",
    template: "%s | Lic. Erika Cruz García — ECGAbogados",
  },
  description:
    "Lic. Erika Cruz García, abogada especializada en derecho familiar (divorcio incausado, pensión alimenticia, custodia), trámites fiscales ante el SAT y asesoría empresarial en Tecámac, Estado de México.",
  keywords: [
    "Erika Cruz García",
    "Erika Cruz García abogada",
    "abogada Tecámac",
    "abogado divorcio Estado de México",
    "ECGAbogados",
  ],
  openGraph: {
    title: "Lic. Erika Cruz García | Abogada de derecho familiar — ECGAbogados",
    description:
      "Acompañamiento legal personalizado en trámites familiares, fiscales y empresariales: divorcio incausado, pensión alimenticia, custodia, SAT y más.",
    siteName: "ECGAbogados",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html
      lang="es"
      className={`${playfair.variable} ${cormorant.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full bg-brand-ink font-sans text-brand-cream antialiased">
        {children}

        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {metaPixelId && (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
