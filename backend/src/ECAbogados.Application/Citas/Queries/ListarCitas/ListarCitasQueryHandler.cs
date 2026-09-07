using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Queries.ListarCitas;

public class ListarCitasQueryHandler(ICitaRepository citaRepository)
    : IRequestHandler<ListarCitasQuery, IReadOnlyList<CitaDto>>
{
    public async Task<IReadOnlyList<CitaDto>> Handle(ListarCitasQuery request, CancellationToken cancellationToken)
    {
        var citas = await citaRepository.GetAllAsync();

        return citas
            .Select(c => new CitaDto(c.Id, c.CasoId, c.NombreCliente, c.Telefono, c.FechaHora, c.Estatus))
            .ToList();
    }
}
