using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.CatalogoSAT.Commands.ActualizarTramiteCatalogo;

public record ActualizarTramiteCatalogoCommand(int Id, string Nombre, string? Requisitos, string? Etapas, string? Observaciones) : IRequest;
