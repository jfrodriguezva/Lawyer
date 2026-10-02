namespace ECAbogados.Domain.Entities;

public enum EstatusCita
{
    Pendiente,
    Confirmada,
    Cancelada,
    // Resultado de una cita Confirmada una vez que pasó su hora. Ya existían en
    // el CHECK de dbo.Citas; sin ellos aquí, una sola fila con estos valores
    // hacía fallar Enum.Parse y dejaba sin cargar la agenda y el dashboard.
    Realizada,
    NoAsistio
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
    public string? ServicioInteres { get; set; }
}
