using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.CrearCaso;

public class CrearCasoCommandHandler(
    ICasoRepository casoRepository,
    IChecklistItemRepository checklistItemRepository) : IRequestHandler<CrearCasoCommand, int>
{
    public async Task<int> Handle(CrearCasoCommand request, CancellationToken cancellationToken)
    {
        var caso = new Caso
        {
            ClienteNombre = request.ClienteNombre,
            Tipo = request.Tipo,
            Estatus = EstatusCaso.Activo,
            FechaApertura = DateTime.UtcNow,
            Notas = request.Notas,
            TokenAcceso = Guid.NewGuid().ToString("N"),
            TokenGeneradoEn = DateTime.UtcNow
        };

        var id = await casoRepository.CreateAsync(caso);

        var requisitos = RequisitosPorTipo.Obtener(request.Tipo);
        if (requisitos.Length > 0)
        {
            await checklistItemRepository.CreateManyAsync(id, requisitos);
        }

        return id;
    }
}
