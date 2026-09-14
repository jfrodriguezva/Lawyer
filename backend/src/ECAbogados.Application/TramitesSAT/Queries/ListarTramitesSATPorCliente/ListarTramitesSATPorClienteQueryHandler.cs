using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSATPorCliente;

// Usado tanto por el staff (detalle de un cliente) como por el propio Cliente
// en su portal: siempre filtrado por ClienteId, nunca expone trámites de otros.
public class ListarTramitesSATPorClienteQueryHandler(
    ITramiteSATRepository tramiteRepository,
    ICatalogoTramiteSATRepository catalogoRepository,
    IUsuarioRepository usuarioRepository) : IRequestHandler<ListarTramitesSATPorClienteQuery, IReadOnlyList<TramiteSATDto>>
{
    public async Task<IReadOnlyList<TramiteSATDto>> Handle(ListarTramitesSATPorClienteQuery request, CancellationToken cancellationToken)
    {
        var tramites = await tramiteRepository.GetByClienteIdAsync(request.ClienteId);
        var catalogo = await catalogoRepository.GetAllAsync();
        var usuarios = await usuarioRepository.GetAllAsync();

        var catalogoPorId = catalogo.ToDictionary(c => c.Id, c => c.Nombre);
        var usuariosPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        return tramites
            .Select(t => new TramiteSATDto(
                t.Id, t.ClienteId, null,
                t.CatalogoTramiteId,
                catalogoPorId.TryGetValue(t.CatalogoTramiteId, out var nombreTramite) ? nombreTramite : null,
                t.Estatus, t.ResponsableUsuarioId,
                t.ResponsableUsuarioId is int rid && usuariosPorId.TryGetValue(rid, out var nombreResp) ? nombreResp : null,
                t.FechaLimite, t.Observaciones, t.FechaCreacion))
            .ToList();
    }
}
