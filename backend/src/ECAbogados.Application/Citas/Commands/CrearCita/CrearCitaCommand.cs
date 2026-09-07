using MediatR;

namespace ECAbogados.Application.Citas.Commands.CrearCita;

public record CrearCitaCommand(
    int? CasoId,
    string NombreCliente,
    string Telefono,
    DateTime FechaHora) : IRequest<int>;
