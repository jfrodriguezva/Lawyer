using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Queries.ObtenerCitaPorId;

public class ObtenerCitaPorIdQueryHandler(ICitaRepository citaRepository)
    : IRequestHandler<ObtenerCitaPorIdQuery, CitaDto?>
{
    public async Task<CitaDto?> Handle(ObtenerCitaPorIdQuery request, CancellationToken cancellationToken)
    {
        var cita = await citaRepository.GetByIdAsync(request.Id);

        return cita is null
            ? null
            : new CitaDto(cita.Id, cita.CasoId, cita.NombreCliente, cita.Telefono, cita.FechaHora, cita.Estatus, cita.ServicioInteres);
    }
}
