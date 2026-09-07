using ECAbogados.Domain.Entities;
using MediatR;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public record CambiarEstatusCasoCommand(int Id, EstatusCaso Estatus) : IRequest;
