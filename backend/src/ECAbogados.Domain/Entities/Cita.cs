namespace ECAbogados.Domain.Entities;

public enum EstatusCita
{
    Pendiente,
    Confirmada,
    Cancelada
}

public class Cita
{
    public int Id { get; set; }
    public int? CasoId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public EstatusCita Estatus { get; set; }
    public bool RecordatorioEnviado { get; set; }
}
