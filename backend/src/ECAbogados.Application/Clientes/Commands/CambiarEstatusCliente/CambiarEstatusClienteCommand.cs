using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Commands.CambiarEstatusCliente;

public record CambiarEstatusClienteCommand(int Id, bool Activo) : IRequest;
