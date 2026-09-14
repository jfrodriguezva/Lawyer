using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.TramitesSAT.Queries.ListarTramitesSAT;

public class ListarTramitesSATQueryHandler(
    ITramiteSATRepository tramiteRepository,
    IClienteRepository clienteRepository,
    ICatalogoTramiteSATRepository catalogoRepository,
    IUsuarioRepository usuarioRepository) : IRequestHandler<ListarTramitesSATQuery, IReadOnlyList<TramiteSATDto>>
{
    public async Task<IReadOnlyList<TramiteSATDto>> Handle(ListarTramitesSATQuery request, CancellationToken cancellationToken)
    {
        var tramites = await tramiteRepository.GetAllAsync();
        var clientes = await clienteRepository.GetAllAsync();
        var catalogo = await catalogoRepository.GetAllAsync();
        var usuarios = await usuarioRepository.GetAllAsync();

        var clientesPorId = clientes.ToDictionary(c => c.Id, c => c.Nombre);
        var catalogoPorId = catalogo.ToDictionary(c => c.Id, c => c.Nombre);
        var usuariosPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        return tramites
            .Select(t => new TramiteSATDto(
                t.Id, t.ClienteId,
                clientesPorId.TryGetValue(t.ClienteId, out var nombreCliente) ? nombreCliente : null,
                t.CatalogoTramiteId,
                catalogoPorId.TryGetValue(t.CatalogoTramiteId, out var nombreTramite) ? nombreTramite : null,
                t.Estatus, t.ResponsableUsuarioId,
                t.ResponsableUsuarioId is int rid && usuariosPorId.TryGetValue(rid, out var nombreResp) ? nombreResp : null,
                t.FechaLimite, t.Observaciones, t.FechaCreacion))
            .ToList();
    }
}
