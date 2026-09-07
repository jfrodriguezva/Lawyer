namespace ECAbogados.Domain.Entities;

public class ChecklistItem
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public bool Completado { get; set; }
}
