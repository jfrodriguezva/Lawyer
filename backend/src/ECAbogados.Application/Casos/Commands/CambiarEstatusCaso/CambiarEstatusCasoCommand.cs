using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.CambiarEstatusCaso;

public record CambiarEstatusCasoCommand(int Id, EstatusCaso Estatus) : IRequest;
