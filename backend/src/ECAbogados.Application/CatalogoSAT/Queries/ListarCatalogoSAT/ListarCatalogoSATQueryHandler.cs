using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.CatalogoSAT.Queries.ListarCatalogoSAT;

public class ListarCatalogoSATQueryHandler(ICatalogoTramiteSATRepository catalogoRepository) : IRequestHandler<ListarCatalogoSATQuery, IReadOnlyList<CatalogoTramiteSAT>>
{
    public Task<IReadOnlyList<CatalogoTramiteSAT>> Handle(ListarCatalogoSATQuery request, CancellationToken cancellationToken) =>
        catalogoRepository.GetAllAsync();
}
