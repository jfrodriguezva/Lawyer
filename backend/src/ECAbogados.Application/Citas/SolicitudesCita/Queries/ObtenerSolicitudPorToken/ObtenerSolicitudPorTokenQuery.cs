using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ObtenerSolicitudPorToken;

public record ObtenerSolicitudPorTokenQuery(string Token) : IRequest<SolicitudCitaPublicaDto?>;
