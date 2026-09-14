using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.CatalogoSAT.Queries.ListarCatalogoSAT;

public record ListarCatalogoSATQuery : IRequest<IReadOnlyList<CatalogoTramiteSAT>>;
