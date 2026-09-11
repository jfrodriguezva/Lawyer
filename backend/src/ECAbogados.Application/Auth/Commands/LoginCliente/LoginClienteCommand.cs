using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Auth.Commands.LoginCliente;

public record LoginClienteCommand(string Email, string Password) : IRequest<LoginResponse>;
