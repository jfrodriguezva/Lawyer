using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Reportes.Queries.ReporteCasos;

// Reportes por cliente, abogado, tipo de asunto, estado y periodo. Filtra en
// memoria sobre el listado completo: para el volumen de un despacho boutique
// no justifica una consulta SQL de agregación dedicada.
public class ReporteCasosQueryHandler(ICasoRepository casoRepository, IUsuarioRepository usuarioRepository)
    : IRequestHandler<ReporteCasosQuery, ReporteCasosDto>
{
    public async Task<ReporteCasosDto> Handle(ReporteCasosQuery request, CancellationToken cancellationToken)
    {
        var casos = await casoRepository.GetAllAsync();
        var usuarios = await usuarioRepository.GetAllAsync();
        var nombresPorId = usuarios.ToDictionary(u => u.Id, u => u.Nombre);

        var filtrados = casos.Where(c =>
            (request.Desde is null || c.FechaApertura >= request.Desde) &&
            (request.Hasta is null || c.FechaApertura <= request.Hasta) &&
            (request.AbogadoResponsableId is null || c.AbogadoResponsableId == request.AbogadoResponsableId) &&
            (string.IsNullOrWhiteSpace(request.Tipo) || c.Tipo == request.Tipo) &&
            (request.Estatus is null || c.Estatus == request.Estatus))
            .ToList();

        var dtos = filtrados
            .Select(c => new CasoDto(
                c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FechaApertura, c.Notas,
                c.AbogadoResponsableId,
                c.AbogadoResponsableId is int aid && nombresPorId.TryGetValue(aid, out var nombre) ? nombre : null,
                c.Prioridad, c.FolioInterno, c.Archivado))
            .ToList();

        var porEstatus = filtrados.GroupBy(c => c.Estatus.ToString()).ToDictionary(g => g.Key, g => g.Count());
        var porTipo = filtrados.GroupBy(c => c.Tipo).ToDictionary(g => g.Key, g => g.Count());
        var porAbogado = filtrados
            .GroupBy(c => c.AbogadoResponsableId is int aid && nombresPorId.TryGetValue(aid, out var nombre) ? nombre : "Sin asignar")
            .ToDictionary(g => g.Key, g => g.Count());

        return new ReporteCasosDto(filtrados.Count, porEstatus, porTipo, porAbogado, dtos);
    }
}
