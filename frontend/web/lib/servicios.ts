// Contenido de marketing para las landings de servicio adicionales (/servicios/[slug]).
// NOTA: este copy es un borrador inicial en el mismo tono que la página principal;
// la Lic. Erika Cruz García debe revisarlo/ajustarlo antes de publicarlo.

export interface ServicioContenido {
  slug: string;
  tipo: string; // debe coincidir con el valor usado en el panel (casos/page.tsx)
  frase: string;
  titulo: string;
  descripcion: string;
  beneficios: { titulo: string; texto: string }[];
  proceso: { numero: string; titulo: string; texto: string }[];
}

export const SERVICIOS: ServicioContenido[] = [
  {
    slug: "pension-alimenticia",
    tipo: "Pensión alimenticia",
    frase: "El derecho de tus hijos no espera",
    titulo: "Pensión alimenticia",
    descripcion:
      "Te ayudamos a fijar, aumentar o hacer valer la pensión alimenticia de tus hijas e hijos, con un procedimiento claro y acompañamiento en cada audiencia.",
    beneficios: [
      { titulo: "Cálculo justo", texto: "Analizamos ingresos y necesidades reales para proponer un monto justo." },
      { titulo: "Seguimiento del pago", texto: "Te orientamos si el pago se incumple y sobre las medidas legales disponibles." },
      { titulo: "Protección de menores", texto: "Priorizamos siempre el bienestar de las hijas e hijos involucrados." },
      { titulo: "Presencial o en línea", texto: "Agenda tu asesoría como prefieras, sin necesidad de trasladarte si no puedes." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos tu situación económica y familiar para definir la estrategia." },
      { numero: "02", titulo: "Presentación de la demanda", texto: "Integramos el expediente y lo presentamos ante el juzgado familiar." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos hasta obtener la fijación o el cumplimiento de la pensión." },
    ],
  },
  {
    slug: "custodia",
    tipo: "Custodia",
    frase: "El bienestar de tus hijos, tu prioridad",
    titulo: "Custodia",
    descripcion:
      "Te representamos en procesos de custodia (guarda y custodia) buscando siempre el mejor interés de tus hijas e hijos y un acuerdo claro para ambas partes.",
    beneficios: [
      { titulo: "Enfoque en el menor", texto: "La estrategia siempre se centra en el bienestar de las hijas e hijos." },
      { titulo: "Evaluación de tu caso", texto: "Analizamos tu situación de convivencia antes de trazar el camino legal." },
      { titulo: "Acompañamiento total", texto: "Te asesoramos desde la demanda hasta la resolución final." },
      { titulo: "Confidencialidad", texto: "Manejamos tu caso con total discreción y respeto." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Evaluamos la situación actual de convivencia y viabilidad del caso." },
      { numero: "02", titulo: "Presentación de la demanda", texto: "Reunimos la documentación necesaria y presentamos la demanda ante el juzgado familiar." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos en cada audiencia hasta la sentencia." },
    ],
  },
  {
    slug: "regimen-de-visitas",
    tipo: "Régimen de visitas",
    frase: "Tiempo de calidad, garantizado por ley",
    titulo: "Régimen de visitas",
    descripcion:
      "Definimos o ajustamos el régimen de convivencias para garantizar tiempo de calidad con tus hijas e hijos, dentro de un marco legal claro.",
    beneficios: [
      { titulo: "Acuerdos claros", texto: "Proponemos calendarios de convivencia realistas y respetuosos." },
      { titulo: "Resolución de conflictos", texto: "Te apoyamos si el régimen actual no se está respetando." },
      { titulo: "Rapidez", texto: "Buscamos la vía más ágil posible para resolver tu situación." },
      { titulo: "Seguimiento cercano", texto: "Te acompañamos desde la solicitud hasta que el acuerdo quede vigente." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos tu situación actual de convivencia con tus hijas e hijos." },
      { numero: "02", titulo: "Presentación de la solicitud", texto: "Integramos y presentamos la propuesta de régimen ante el juzgado." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos hasta que el régimen quede formalmente establecido." },
    ],
  },
  {
    slug: "violencia-familiar",
    tipo: "Violencia familiar",
    frase: "No estás sola, no estás solo",
    titulo: "Violencia familiar",
    descripcion:
      "Te acompañamos con seriedad y confidencialidad en procesos por violencia familiar, incluyendo medidas de protección para ti y tu familia.",
    beneficios: [
      { titulo: "Atención inmediata", texto: "Respondemos con prioridad ante situaciones de riesgo." },
      { titulo: "Medidas de protección", texto: "Te orientamos sobre las órdenes de protección disponibles." },
      { titulo: "Confidencialidad total", texto: "Tu caso se maneja con la máxima discreción." },
      { titulo: "Acompañamiento humano", texto: "Te escuchamos y te guiamos en cada paso, sin juicios." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Escuchamos tu situación y evaluamos las medidas urgentes necesarias." },
      { numero: "02", titulo: "Medidas y denuncia", texto: "Te apoyamos a solicitar medidas de protección y, si procede, a denunciar." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos en el proceso legal hasta su conclusión." },
    ],
  },
];

export function getServicioPorSlug(slug: string): ServicioContenido | undefined {
  return SERVICIOS.find((s) => s.slug === slug);
}
