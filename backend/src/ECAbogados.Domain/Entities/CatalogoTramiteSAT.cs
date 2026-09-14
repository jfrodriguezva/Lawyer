namespace ECAbogados.Domain.Entities;

/// <summary>
/// Catálogo de trámites SAT que el despacho da de alta manualmente. El sistema
/// nunca infiere ni afirma requisitos fiscales por sí mismo: todo el contenido
/// (Requisitos/Etapas/Observaciones) lo captura el despacho y puede quedar vacío.
/// </summary>
public class CatalogoTramiteSAT
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Requisitos { get; set; }
    public string? Etapas { get; set; }
    public string? Observaciones { get; set; }
    public bool Activo { get; set; } = true;
}
