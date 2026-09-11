namespace ECAbogados.Application.Casos;

public static class RequisitosPorTipo
{
    private static readonly Dictionary<string, string[]> Catalogo = new()
    {
        ["Divorcio"] =
        [
            "Acta de matrimonio (copia certificada reciente)",
            "Identificación oficial del cliente",
            "Comprobante de domicilio",
            "Actas de nacimiento de los hijos (si aplica)",
        ],
        ["Pensión alimenticia"] =
        [
            "Identificación oficial del cliente",
            "Actas de nacimiento de los hijos",
            "Comprobante de ingresos del deudor alimentario (si se tiene)",
            "Comprobante de domicilio",
        ],
        ["Custodia"] =
        [
            "Identificación oficial del cliente",
            "Actas de nacimiento de los hijos",
            "Comprobante de domicilio",
            "Evidencia de la situación actual de convivencia",
        ],
        ["Régimen de visitas"] =
        [
            "Identificación oficial del cliente",
            "Actas de nacimiento de los hijos",
            "Comprobante de domicilio",
        ],
        ["Violencia familiar"] =
        [
            "Identificación oficial del cliente",
            "Evidencia del hecho (mensajes, fotos, partes médicos, etc.)",
            "Comprobante de domicilio",
        ],
        ["Divorcio incausado"] =
        [
            "Acta de matrimonio (copia certificada reciente)",
            "Identificación oficial del cliente",
            "Comprobante de domicilio",
            "Actas de nacimiento de los hijos (si aplica)",
        ],
        ["Divorcio por mutuo consentimiento"] =
        [
            "Acta de matrimonio (copia certificada reciente)",
            "Identificación oficial de ambos cónyuges",
            "Comprobante de domicilio",
            "Actas de nacimiento de los hijos (si aplica)",
            "Convenio propuesto (bienes, custodia y pensión, si aplica)",
        ],
        ["Sucesiones y herencias"] =
        [
            "Acta de defunción",
            "Testamento (si existe) o declaración de no existir",
            "Identificación oficial del solicitante",
            "Actas que acrediten el parentesco con el fallecido",
            "Relación de bienes del fallecido",
        ],
        ["Cobranza y pagarés"] =
        [
            "Pagaré, contrato o título que acredite el adeudo",
            "Identificación oficial del cliente",
            "Datos de identificación y domicilio del deudor",
            "Comprobantes de requerimientos de pago previos (si existen)",
        ],
        ["Contratos"] =
        [
            "Identificación oficial del cliente",
            "Datos de la contraparte (nombre/razón social y domicilio)",
            "Documentación o borrador previo del acuerdo (si existe)",
        ],
        ["Trámites SAT"] =
        [
            "Identificación oficial (o del representante legal)",
            "RFC y constancia de situación fiscal",
            "Requerimiento o carta del SAT recibida (si aplica)",
            "Comprobantes fiscales relacionados con el trámite",
        ],
        ["Asesoría legal para empresas"] =
        [
            "Identificación oficial del solicitante o representante legal",
            "Acta constitutiva o documentos de la empresa (si ya existe)",
            "Descripción del asunto o contrato a revisar",
        ],
    };

    public static string[] Obtener(string tipo) =>
        Catalogo.TryGetValue(tipo, out var requisitos) ? requisitos : [];
}
