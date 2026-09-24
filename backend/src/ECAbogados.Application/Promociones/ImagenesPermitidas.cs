namespace ECAbogados.Application.Promociones;

public static class ImagenesPermitidas
{
    public const long TamanoMaximoBytes = 5_000_000; // 5 MB, alcanza de sobra para una imagen de promoción

    private static readonly HashSet<string> Extensiones = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    public static bool EsExtensionPermitida(string nombreArchivo)
    {
        var extension = Path.GetExtension(nombreArchivo);
        return !string.IsNullOrEmpty(extension) && Extensiones.Contains(extension);
    }

    public static string ExtensionesPermitidasTexto => string.Join(", ", Extensiones.OrderBy(e => e));
}
