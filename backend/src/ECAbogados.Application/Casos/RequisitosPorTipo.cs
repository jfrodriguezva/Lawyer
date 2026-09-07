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
    };

    public static string[] Obtener(string tipo) =>
        Catalogo.TryGetValue(tipo, out var requisitos) ? requisitos : [];
}
