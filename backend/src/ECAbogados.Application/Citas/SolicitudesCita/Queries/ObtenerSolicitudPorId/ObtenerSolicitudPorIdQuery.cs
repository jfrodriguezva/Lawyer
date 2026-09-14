using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorId;

public record ObtenerSolicitudPorIdQuery(int Id) : IRequest<SolicitudCitaDto?>;
