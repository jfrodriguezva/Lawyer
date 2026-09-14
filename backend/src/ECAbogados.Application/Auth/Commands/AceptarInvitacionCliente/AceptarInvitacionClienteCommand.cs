using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.AceptarInvitacionCliente;

public record AceptarInvitacionClienteCommand(string Token, string NuevaPassword) : IRequest;
