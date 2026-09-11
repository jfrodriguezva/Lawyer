using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Commands.CrearCliente;

public record CrearClienteCommand(string Email, string Password, string Nombre) : IRequest<int>;
