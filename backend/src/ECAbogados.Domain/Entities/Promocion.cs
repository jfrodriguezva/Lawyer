namespace ECAbogados.Domain.Entities;

/// <summary>
/// Promoción con imagen y texto, asignable a uno o varios Servicios
/// (dbo.PromocionServicios). Activo controla si se muestra en el sitio
/// público (banner del servicio + aviso en el NavBar).
/// </summary>
public class Promocion
{
    public int Id { get; set; }
    public string Texto { get; set; } = string.Empty;
    public string NombreArchivo { get; set; } = string.Empty;
    public string TipoContenido { get; set; } = string.Empty;
    public string RutaAlmacenamiento { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
    public List<int> ServicioIds { get; set; } = [];
}
