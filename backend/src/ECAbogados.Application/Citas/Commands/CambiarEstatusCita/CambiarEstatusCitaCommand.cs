using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Commands.CambiarEstatusCita;

public record CambiarEstatusCitaCommand(int Id, EstatusCita Estatus) : IRequest;
