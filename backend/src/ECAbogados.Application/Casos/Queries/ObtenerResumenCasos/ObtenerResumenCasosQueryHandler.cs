using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Casos.Queries.ObtenerResumenCasos;

public class ObtenerResumenCasosQueryHandler(ICasoRepository casoRepository, IUsuarioRepository usuarioRepository)
    : IRequestHandler<ObtenerResumenCasosQuery, ResumenCasosDto>
{
    private const int TopActivosRecientes = 5;

    public async Task<ResumenCasosDto> Handle(ObtenerResumenCasosQuery request, CancellationToken cancellationToken)
    {
        var conteoTask = casoRepository.GetConteoPorEstatusAsync();
        var recientesTask = casoRepository.GetRecientesPorEstatusAsync(nameof(EstatusCaso.Activo), TopActivosRecientes);
        var usuariosTask = usuarioRepository.GetAllAsync();
        await Task.WhenAll(conteoTask, recientesTask, usuariosTask);

        var conteo = conteoTask.Result;
        var nombresPorId = usuariosTask.Result.ToDictionary(u => u.Id, u => u.Nombre);

        var activosRecientes = recientesTask.Result
            .Select(c => new CasoDto(
                c.Id, c.ClienteNombre, c.Tipo, c.Estatus, c.FechaApertura, c.Notas,
                c.AbogadoResponsableId,
                c.AbogadoResponsableId is int abogadoId && nombresPorId.TryGetValue(abogadoId, out var nombre) ? nombre : null,
                c.Prioridad, c.FolioInterno, c.Archivado))
            .ToList();

        return new ResumenCasosDto(
            conteo.GetValueOrDefault(nameof(EstatusCaso.Activo)),
            conteo.GetValueOrDefault(nameof(EstatusCaso.Revision)),
            conteo.GetValueOrDefault(nameof(EstatusCaso.Cerrado)),
            activosRecientes);
    }
}
