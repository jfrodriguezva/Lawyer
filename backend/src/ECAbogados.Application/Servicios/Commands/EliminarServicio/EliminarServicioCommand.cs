using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Servicios.Commands.EliminarServicio;

public record EliminarServicioCommand(int Id) : IRequest;
