using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Plantillas.Queries.ListarPlantillas;

public record ListarPlantillasQuery : IRequest<IReadOnlyList<PlantillaMensaje>>;
