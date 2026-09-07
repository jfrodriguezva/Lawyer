namespace ECAbogados.Domain.Entities;

public enum EstatusCaso
{
    Activo,
    Revision,
    Cerrado
}

public class Caso
{
    public int Id { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public EstatusCaso Estatus { get; set; }
    public DateTime FechaApertura { get; set; }
    public string? Notas { get; set; }
}
