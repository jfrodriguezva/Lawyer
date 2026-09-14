using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.CatalogoSAT.Commands.CrearTramiteCatalogo;

public record CrearTramiteCatalogoCommand(string Nombre, string? Requisitos, string? Etapas, string? Observaciones) : IRequest<int>;
