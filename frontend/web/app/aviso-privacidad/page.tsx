import type { Metadata } from "next";
import Link from "next/link";
import GuestHeader from "@/components/GuestHeader";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de ECGAbogados para el tratamiento de datos personales.",
  alternates: { canonical: "/aviso-privacidad" },
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-brand-ink">
      <GuestHeader />

      <main className="relative mx-auto max-w-3xl px-6 pb-28 pt-14 lg:pt-20">
        <p className="font-script text-lg italic text-brand-gold">Protección de datos personales</p>
        <h1 className="mt-1 text-balance font-display text-4xl font-bold text-brand-cream sm:text-5xl">
          Aviso de privacidad
        </h1>
        <p className="mt-4 text-sm text-brand-creamSoft">Última actualización: 17 de septiembre de 2026</p>

        <div className="mt-10 space-y-10 text-brand-creamSoft">
          <Seccion titulo="1. Identidad y domicilio del responsable">
            <p>
              ECGAbogados, a cargo de la Lic. Erika Cruz García (en adelante, &ldquo;el despacho&rdquo;), con
              domicilio en Av. Bosques del Estado de México 4-1 P1 LT, Los Héroes Tecámac, C.P. 55764, Tecámac,
              Estado de México, es responsable del tratamiento de tus datos personales conforme a lo previsto por
              la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su
              Reglamento.
            </p>
            <p className="mt-3">
              Las asesorías se llevan a cabo previa cita. Puedes contactar al despacho en cualquier momento a
              través de los medios señalados en este aviso (domicilio, correo y teléfono), que son permanentes y
              no cambian de una cita a otra.
            </p>
          </Seccion>

          <Seccion titulo="2. Datos personales que recabamos">
            <p>Dependiendo del servicio que solicites, podemos recabar:</p>
            <List
              items={[
                "Datos de identificación y contacto: nombre completo, teléfono, correo electrónico.",
                "Datos sobre el motivo de tu consulta y el servicio de tu interés (familiar, fiscal/SAT o empresarial).",
                "Datos del expediente que nos compartas para brindarte asesoría: documentos, actas, comprobantes y demás información relacionada con tu caso.",
              ]}
            />
            <p className="mt-3">
              Algunos servicios (por ejemplo, asuntos de violencia familiar, custodia o pensión alimenticia) pueden
              implicar el tratamiento de <strong className="text-brand-cream">datos personales sensibles</strong>{" "}
              en términos del artículo 3, fracción VI de la LFPDPPP (por ejemplo, información sobre tu vida familiar
              o, en su caso, tu estado de salud si es relevante para el caso). Tratamos estos datos con medidas de
              seguridad reforzadas y solo para los fines estrictamente relacionados con tu asesoría legal.
            </p>
          </Seccion>

          <Seccion titulo="3. Finalidades del tratamiento">
            <p className="font-semibold text-brand-cream">Finalidades primarias (necesarias para el servicio):</p>
            <List
              items={[
                "Evaluar tu solicitud de asesoría y darte seguimiento.",
                "Abrir y dar seguimiento a tu expediente si decides contratar nuestros servicios.",
                "Agendar y confirmar citas.",
                "Comunicarnos contigo sobre el estatus de tu caso, trámite o cita.",
                "Cumplir con las obligaciones que se deriven de la relación jurídica entre tú y el despacho.",
              ]}
            />
            <p className="mt-3 font-semibold text-brand-cream">Finalidades secundarias (no necesarias, puedes oponerte):</p>
            <List
              items={[
                "Enviarte información sobre otros servicios del despacho.",
                "Fines estadísticos y de mejora de este sitio web (ver sección de cookies y tecnologías de rastreo).",
              ]}
            />
            <p className="mt-3">
              Si no deseas que tus datos se usen para las finalidades secundarias, puedes indicarlo al momento de
              proporcionarlos o en cualquier momento posterior, escribiendo a{" "}
              <a href="mailto:contacto@ecgabogados.com" className="text-brand-gold hover:underline">
                contacto@ecgabogados.com
              </a>
              .
            </p>
          </Seccion>

          <Seccion titulo="4. Transferencia de datos">
            <p>
              No transferimos tus datos personales a terceros, salvo que exista una obligación legal que nos
              obligue a ello (por ejemplo, un requerimiento de autoridad competente) o que sea estrictamente
              necesario para llevar a cabo tu trámite (por ejemplo, ante el SAT u otra autoridad, únicamente con tu
              conocimiento y en el contexto del servicio que solicitaste).
            </p>
          </Seccion>

          <Seccion titulo="5. Derechos ARCO y cómo ejercerlos">
            <p>
              Tienes derecho a Acceder a tus datos personales, Rectificarlos si son inexactos, Cancelarlos cuando
              consideres que no se requieren para alguna de las finalidades señaladas, u Oponerte al tratamiento de
              los mismos para fines específicos (derechos ARCO). También puedes revocar el consentimiento que en su
              caso nos hayas otorgado.
            </p>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, contáctanos en{" "}
              <a href="mailto:contacto@ecgabogados.com" className="text-brand-gold hover:underline">
                contacto@ecgabogados.com
              </a>{" "}
              o al teléfono <a href="tel:+525574334694" className="text-brand-gold hover:underline">55 7433 4694</a>,
              indicando: (i) tu nombre completo, (ii) el derecho que deseas ejercer y (iii) una copia de tu
              identificación oficial. Te responderemos en un plazo máximo de 20 días hábiles.
            </p>
          </Seccion>

          <Seccion titulo="6. Cookies y tecnologías de rastreo">
            <p>
              Este sitio puede utilizar Google Analytics 4 y/o Meta Pixel para entender cómo se usa y para medir
              la efectividad de nuestra comunicación. Estas herramientas solo se activan si el despacho las
              configura explícitamente y recaban datos de navegación de forma agregada, no datos sensibles de tu
              caso. Puedes controlar las cookies desde la configuración de tu navegador.
            </p>
          </Seccion>

          <Seccion titulo="7. Seguridad">
            <p>
              El despacho implementa medidas administrativas y técnicas razonables para proteger tus datos
              personales contra daño, pérdida, alteración, acceso o tratamiento no autorizado.
            </p>
          </Seccion>

          <Seccion titulo="8. Cambios a este aviso de privacidad">
            <p>
              Este aviso de privacidad puede sufrir modificaciones derivadas de nuevos requerimientos legales,
              de nuestras propias necesidades por los servicios que ofrecemos, o por otras causas. Cualquier
              cambio será publicado en esta misma página, indicando la fecha de la última actualización.
            </p>
          </Seccion>
        </div>

        <div className="mt-16 border-t border-brand-line pt-8">
          <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-brand-gold hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-brand-cream">{titulo}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
