using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Commands.CrearCita;

public record CrearCitaCommand(
    int? CasoId,
    string NombreCliente,
    string Telefono,
    DateTime FechaHora,
    string? ServicioInteres = null) : IRequest<int>;
