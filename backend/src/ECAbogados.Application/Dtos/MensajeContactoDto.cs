namespace ECAbogados.Application.Dtos;

public record MensajeContactoDto(
    int Id,
    string Nombre,
    string Telefono,
    string? Email,
    string Mensaje,
    DateTime FechaEnvio,
    bool Atendido,
    string? ServicioInteres);
