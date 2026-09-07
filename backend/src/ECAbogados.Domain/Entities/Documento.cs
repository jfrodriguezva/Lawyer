namespace ECAbogados.Domain.Entities;

public class Documento
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string TipoContenido { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
    public DateTime FechaCarga { get; set; }
    public string RutaAlmacenamiento { get; set; } = string.Empty;
}
