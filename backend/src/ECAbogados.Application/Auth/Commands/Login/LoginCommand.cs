using ECAbogados.Application.Dtos;
using MediatR;

namespace ECAbogados.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;
