namespace ECAbogados.Domain.Entities;

public class Plazo
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaLimite { get; set; }
    public bool Cumplido { get; set; }
    public bool AlertaEnviada { get; set; }
}
