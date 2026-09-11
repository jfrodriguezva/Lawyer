// Contenido de marketing para las landings de servicio (/servicios/[slug]).
// NOTA: este copy es un borrador inicial en el mismo tono que la página principal;
// la Lic. Erika Cruz García debe revisarlo/ajustarlo antes de publicarlo. La copy de
// "tramites-sat" y "asesoria-empresas" está deliberadamente escrita en un tono distinto
// (orientado a contribuyentes/empresarios) porque son un gancho de captación separado
// del resto de servicios de derecho familiar.
//
// El campo `tipo` de cada entrada debe coincidir exactamente con los valores usados en
// el panel al crear un expediente (`app/(app)/casos/page.tsx`, arreglo TIPOS) y con las
// llaves del catálogo de checklist automático (`backend/.../Casos/RequisitosPorTipo.cs`).

export type IconoBeneficio =
  | "scale"
  | "gavel"
  | "document"
  | "family"
  | "clock"
  | "lock"
  | "handHeart"
  | "pin"
  | "money"
  | "briefcase"
  | "calculator";

export interface ServicioContenido {
  slug: string;
  tipo: string; // debe coincidir con el valor usado en el panel (casos/page.tsx)
  frase: string;
  titulo: string;
  descripcion: string;
  beneficios: { icono: IconoBeneficio; titulo: string; texto: string }[];
  proceso: { numero: string; titulo: string; texto: string }[];
}

export const SERVICIOS: ServicioContenido[] = [
  {
    slug: "divorcio-incausado",
    tipo: "Divorcio incausado",
    frase: "Tu libertad también es un derecho",
    titulo: "Divorcio incausado",
    descripcion:
      "¿Quieres divorciarte y tu pareja no está de acuerdo? En el divorcio incausado no necesitas su consentimiento, ni expresar una causa para solicitarlo. Te acompañamos en cada paso, de principio a fin.",
    beneficios: [
      { icono: "gavel", titulo: "Sin consentimiento del otro", texto: "No necesitas que tu pareja esté de acuerdo ni firme nada para iniciar el proceso." },
      { icono: "scale", titulo: "Asesoría personalizada", texto: "Analizamos tu situación particular antes de trazar la estrategia legal." },
      { icono: "handHeart", titulo: "Acompañamiento total", texto: "Damos seguimiento a tu expediente desde el primer trámite hasta la sentencia." },
      { icono: "family", titulo: "Protección familiar", texto: "Cuidamos tus derechos patrimoniales y los de tus hijas e hijos en todo momento." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos tu situación, resolvemos tus dudas y evaluamos la viabilidad de tu caso sin compromiso." },
      { numero: "02", titulo: "Presentación de la demanda", texto: "Preparamos el expediente y lo presentamos ante el juzgado familiar, sin requerir la firma de la otra parte." },
      { numero: "03", titulo: "Resolución y sentencia", texto: "Te acompañamos en cada audiencia hasta obtener tu sentencia de divorcio y regularizar tu situación legal." },
    ],
  },
  {
    slug: "divorcio-mutuo-consentimiento",
    tipo: "Divorcio por mutuo consentimiento",
    frase: "Cuando ambos están de acuerdo, todo es más rápido",
    titulo: "Divorcio por mutuo consentimiento",
    descripcion:
      "Si tú y tu pareja están de acuerdo en divorciarse, te ayudamos a integrar el convenio (bienes, custodia, pensión) y a llevar el trámite de la forma más ágil posible.",
    beneficios: [
      { icono: "clock", titulo: "Proceso más ágil", texto: "Al no haber controversia, el trámite suele resolverse en menos tiempo." },
      { icono: "document", titulo: "Convenio a tu medida", texto: "Redactamos un convenio claro sobre bienes, custodia y pensión, evitando conflictos futuros." },
      { icono: "scale", titulo: "Equilibrio para ambas partes", texto: "Buscamos un acuerdo justo que proteja los intereses de los dos." },
      { icono: "handHeart", titulo: "Acompañamiento sin desgaste", texto: "Te guiamos en un proceso pensado para cerrar esta etapa en paz." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos su situación patrimonial y familiar para definir el contenido del convenio." },
      { numero: "02", titulo: "Convenio y demanda", texto: "Redactamos el convenio y presentamos la solicitud conjunta ante el juzgado familiar." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos hasta obtener la sentencia que da por concluido el matrimonio." },
    ],
  },
  {
    slug: "pension-alimenticia",
    tipo: "Pensión alimenticia",
    frase: "El derecho de tus hijos no espera",
    titulo: "Pensión alimenticia",
    descripcion:
      "Te ayudamos con la solicitud, aumento, reducción o cancelación de la pensión alimenticia, así como con pensiones atrasadas y su cumplimiento, con un procedimiento claro y acompañamiento en cada audiencia.",
    beneficios: [
      { icono: "scale", titulo: "Cálculo justo", texto: "Analizamos ingresos y necesidades reales para proponer un monto justo." },
      { icono: "document", titulo: "Seguimiento del pago", texto: "Te orientamos si el pago se incumple y sobre las medidas legales disponibles para cobrar atrasos." },
      { icono: "family", titulo: "Protección de menores", texto: "Priorizamos siempre el bienestar de las hijas e hijos involucrados." },
      { icono: "pin", titulo: "Presencial o en línea", texto: "Agenda tu asesoría como prefieras, sin necesidad de trasladarte si no puedes." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos tu situación económica y familiar para definir la estrategia." },
      { numero: "02", titulo: "Presentación de la demanda", texto: "Integramos el expediente y lo presentamos ante el juzgado familiar." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos hasta obtener la fijación, el aumento, la reducción o el cumplimiento de la pensión." },
    ],
  },
  {
    slug: "custodia",
    tipo: "Custodia",
    frase: "El bienestar de tus hijos, tu prioridad",
    titulo: "Guarda y custodia",
    descripcion:
      "Te representamos en procesos de guarda y custodia, asesorándote para determinar con quién vivirán los menores y proteger sus derechos, buscando siempre su mejor interés.",
    beneficios: [
      { icono: "family", titulo: "Enfoque en el menor", texto: "La estrategia siempre se centra en el bienestar de las hijas e hijos." },
      { icono: "scale", titulo: "Evaluación de tu caso", texto: "Analizamos tu situación de convivencia antes de trazar el camino legal." },
      { icono: "handHeart", titulo: "Acompañamiento total", texto: "Te asesoramos desde la demanda hasta la resolución final." },
      { icono: "lock", titulo: "Confidencialidad", texto: "Manejamos tu caso con total discreción y respeto." },
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
    titulo: "Régimen de convivencias",
    descripcion:
      "Establecemos o modificamos el régimen de convivencias para garantizar tiempo de calidad con tus hijas e hijos, dentro de un marco legal claro.",
    beneficios: [
      { icono: "document", titulo: "Acuerdos claros", texto: "Proponemos calendarios de convivencia realistas y respetuosos." },
      { icono: "gavel", titulo: "Resolución de conflictos", texto: "Te apoyamos si el régimen actual no se está respetando." },
      { icono: "clock", titulo: "Rapidez", texto: "Buscamos la vía más ágil posible para resolver tu situación." },
      { icono: "handHeart", titulo: "Seguimiento cercano", texto: "Te acompañamos desde la solicitud hasta que el acuerdo quede vigente." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos tu situación actual de convivencia con tus hijas e hijos." },
      { numero: "02", titulo: "Presentación de la solicitud", texto: "Integramos y presentamos la propuesta de régimen ante el juzgado." },
      { numero: "03", titulo: "Resolución", texto: "Te acompañamos hasta que el régimen quede formalmente establecido." },
    ],
  },
  {
    slug: "sucesiones-herencias",
    tipo: "Sucesiones y herencias",
    frase: "El legado de tu familia, en orden",
    titulo: "Sucesiones y herencias",
    descripcion:
      "Te acompañamos en juicios testamentarios e intestamentarios, para que la herencia se reparta conforme a la ley y sin conflictos innecesarios entre la familia.",
    beneficios: [
      { icono: "document", titulo: "Trámite completo", texto: "Te guiamos desde la apertura de la sucesión hasta la adjudicación de bienes." },
      { icono: "scale", titulo: "Con o sin testamento", texto: "Te asesoramos tanto en sucesiones testamentarias como intestamentarias." },
      { icono: "family", titulo: "Cuidamos a la familia", texto: "Buscamos acuerdos que preserven la relación entre herederos." },
      { icono: "handHeart", titulo: "Acompañamiento sensible", texto: "Entendemos que es un momento difícil y te asesoramos con cercanía." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos si existe testamento y la situación de los bienes y herederos." },
      { numero: "02", titulo: "Integración del juicio", texto: "Reunimos la documentación necesaria e iniciamos el juicio sucesorio correspondiente." },
      { numero: "03", titulo: "Adjudicación", texto: "Te acompañamos hasta la resolución que formaliza el reparto de la herencia." },
    ],
  },
  {
    slug: "cobranza-pagares",
    tipo: "Cobranza y pagarés",
    frase: "Recupera lo que es tuyo",
    titulo: "Cobranza y pagarés",
    descripcion:
      "Te ayudamos a recuperar adeudos vencidos y a hacer valer pagarés mediante juicios mercantiles, con una estrategia clara para cobrar lo que se te debe.",
    beneficios: [
      { icono: "money", titulo: "Recuperación de adeudos", texto: "Evaluamos la vía más efectiva para cobrar tu adeudo." },
      { icono: "gavel", titulo: "Juicios mercantiles", texto: "Te representamos ante el juzgado si el deudor no paga voluntariamente." },
      { icono: "document", titulo: "Revisión de tu título", texto: "Verificamos que tu pagaré o contrato sea exigible legalmente." },
      { icono: "clock", titulo: "Estrategia ágil", texto: "Buscamos la vía más rápida posible según el monto y el deudor." },
    ],
    proceso: [
      { numero: "01", titulo: "Asesoría inicial", texto: "Revisamos el pagaré o contrato y la situación del deudor." },
      { numero: "02", titulo: "Requerimiento o demanda", texto: "Iniciamos el cobro extrajudicial o presentamos la demanda mercantil." },
      { numero: "03", titulo: "Cobro", texto: "Te acompañamos hasta lograr el pago o la ejecución de la sentencia." },
    ],
  },
  {
    slug: "contratos",
    tipo: "Contratos",
    frase: "Que cada acuerdo te proteja",
    titulo: "Contratos",
    descripcion:
      "Elaboramos, revisamos y modificamos contratos para personas y empresas, cuidando que cada cláusula te proteja antes de que firmes.",
    beneficios: [
      { icono: "document", titulo: "Elaboración a tu medida", texto: "Redactamos contratos claros, adaptados a tu operación o situación particular." },
      { icono: "scale", titulo: "Revisión antes de firmar", texto: "Detectamos cláusulas riesgosas antes de que sea tarde." },
      { icono: "gavel", titulo: "Modificación de contratos", texto: "Actualizamos acuerdos vigentes cuando las condiciones cambian." },
      { icono: "clock", titulo: "Respuesta ágil", texto: "Entendemos que muchas veces necesitas el contrato listo con urgencia." },
    ],
    proceso: [
      { numero: "01", titulo: "Diagnóstico", texto: "Entendemos qué necesitas proteger o formalizar." },
      { numero: "02", titulo: "Elaboración o revisión", texto: "Redactamos o revisamos el contrato y te explicamos cada cláusula relevante." },
      { numero: "03", titulo: "Firma", texto: "Te acompañamos hasta la firma, con las modificaciones ya incorporadas." },
    ],
  },
  {
    slug: "tramites-sat",
    tipo: "Trámites SAT",
    frase: "Tu situación fiscal, en manos expertas",
    titulo: "Trámites ante el SAT",
    descripcion:
      "¿Te llegó una carta del SAT o necesitas poner en orden tu situación fiscal? Te orientamos en declaraciones, devoluciones, constancias y regularización fiscal, para personas y negocios.",
    beneficios: [
      { icono: "calculator", titulo: "Declaraciones y devoluciones", texto: "Te apoyamos a presentar o corregir declaraciones y a gestionar devoluciones." },
      { icono: "document", titulo: "Constancias y trámites", texto: "Te ayudamos a obtener constancias de situación fiscal y otros documentos ante el SAT." },
      { icono: "briefcase", titulo: "Regularización fiscal", texto: "Diseñamos un plan para poner al día tu situación ante el fisco." },
      { icono: "clock", titulo: "Atención oportuna", texto: "Respondemos con prioridad cuando hay plazos del SAT de por medio." },
    ],
    proceso: [
      { numero: "01", titulo: "Revisión gratuita", texto: "Analizamos tu situación fiscal actual y el requerimiento o carta recibida, si aplica." },
      { numero: "02", titulo: "Plan de acción", texto: "Te proponemos los trámites necesarios y los plazos a cumplir." },
      { numero: "03", titulo: "Gestión y cierre", texto: "Damos seguimiento ante el SAT hasta resolver tu situación." },
    ],
  },
  {
    slug: "asesoria-empresas",
    tipo: "Asesoría legal para empresas",
    frase: "Blinda legalmente tu negocio",
    titulo: "Asesoría legal para empresas y emprendedores",
    descripcion:
      "Acompañamos a empresas y emprendedores en contratos, prevención de riesgos y asuntos corporativos, para que tomes decisiones de negocio con respaldo legal.",
    beneficios: [
      { icono: "briefcase", titulo: "Asuntos corporativos", texto: "Te asesoramos en la constitución, gobierno y operación legal de tu empresa." },
      { icono: "document", titulo: "Contratos comerciales", texto: "Elaboramos y revisamos los contratos que tu operación necesita." },
      { icono: "scale", titulo: "Prevención de riesgos", texto: "Identificamos riesgos legales antes de que se conviertan en un problema." },
      { icono: "clock", titulo: "Acompañamiento continuo", texto: "Te asesoramos de forma puntual o de manera continua, según lo que tu negocio necesite." },
    ],
    proceso: [
      { numero: "01", titulo: "Diagnóstico legal", texto: "Revisamos la situación actual de tu empresa o proyecto." },
      { numero: "02", titulo: "Plan de acción", texto: "Definimos qué contratos, políticas o trámites necesitas resolver primero." },
      { numero: "03", titulo: "Implementación", texto: "Te acompañamos hasta dejar tu operación legalmente en orden." },
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
      { icono: "clock", titulo: "Atención inmediata", texto: "Respondemos con prioridad ante situaciones de riesgo." },
      { icono: "gavel", titulo: "Medidas de protección", texto: "Te orientamos sobre las órdenes de protección disponibles." },
      { icono: "lock", titulo: "Confidencialidad total", texto: "Tu caso se maneja con la máxima discreción." },
      { icono: "handHeart", titulo: "Acompañamiento humano", texto: "Te escuchamos y te guiamos en cada paso, sin juicios." },
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
