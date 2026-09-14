using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.CatalogoSAT.Commands.CambiarEstatusTramiteCatalogo;

public record CambiarEstatusTramiteCatalogoCommand(int Id, bool Activo) : IRequest;
