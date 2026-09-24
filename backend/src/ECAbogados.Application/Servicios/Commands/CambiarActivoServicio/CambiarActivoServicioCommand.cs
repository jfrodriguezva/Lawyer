using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Servicios.Commands.CambiarActivoServicio;

public record CambiarActivoServicioCommand(int Id, bool Activo) : IRequest;
