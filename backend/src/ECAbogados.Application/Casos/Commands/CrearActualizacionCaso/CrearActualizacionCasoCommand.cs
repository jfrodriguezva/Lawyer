using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Casos.Commands.CrearActualizacionCaso;

public record CrearActualizacionCasoCommand(int CasoId, string Texto, VisibilidadActualizacion Visibilidad) : IRequest<int>;
