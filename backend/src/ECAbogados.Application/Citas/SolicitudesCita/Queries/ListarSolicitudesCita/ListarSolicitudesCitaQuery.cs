using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Queries.ListarSolicitudesCita;

public record ListarSolicitudesCitaQuery(ModuloSolicitud? Modulo = null) : IRequest<IReadOnlyList<SolicitudCitaDto>>;
