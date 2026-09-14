using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Prospectos.Queries.ObtenerProspectoPorId;

public record ObtenerProspectoPorIdQuery(int Id) : IRequest<ProspectoDetalleDto?>;

public record ProspectoDetalleDto(
    ProspectoDto Prospecto,
    IReadOnlyList<SolicitudCitaDto> Solicitudes);
