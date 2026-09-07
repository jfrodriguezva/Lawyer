using ECAbogados.Domain.Entities;
using MediatR;

namespace ECAbogados.Application.Citas.Commands.CambiarEstatusCita;

public record CambiarEstatusCitaCommand(int Id, EstatusCita Estatus) : IRequest;
