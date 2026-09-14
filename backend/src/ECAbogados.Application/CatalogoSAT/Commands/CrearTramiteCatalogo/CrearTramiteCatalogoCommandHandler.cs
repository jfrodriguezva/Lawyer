using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.CatalogoSAT.Commands.CrearTramiteCatalogo;

public class CrearTramiteCatalogoCommandHandler(ICatalogoTramiteSATRepository catalogoRepository) : IRequestHandler<CrearTramiteCatalogoCommand, int>
{
    public Task<int> Handle(CrearTramiteCatalogoCommand request, CancellationToken cancellationToken) =>
        catalogoRepository.CreateAsync(new CatalogoTramiteSAT
        {
            Nombre = request.Nombre,
            Requisitos = request.Requisitos,
            Etapas = request.Etapas,
            Observaciones = request.Observaciones
        });
}
