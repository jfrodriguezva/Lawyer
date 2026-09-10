namespace ECAbogados.Application.Documentos;

public static class TiposPermitidos
{
    public const long TamanoMaximoBytes = 50_000_000; // 50 MB, igual al límite del request

    private static readonly HashSet<string> Extensiones = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"
    };

    public static bool EsExtensionPermitida(string nombreArchivo)
    {
        var extension = Path.GetExtension(nombreArchivo);
        return !string.IsNullOrEmpty(extension) && Extensiones.Contains(extension);
    }

    public static string ExtensionesPermitidasTexto => string.Join(", ", Extensiones.OrderBy(e => e));
}
