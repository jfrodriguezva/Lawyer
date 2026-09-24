using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Servicios.Commands.CrearServicio;

public record CrearServicioCommand(
    int ModuloId,
    string Slug,
    string Titulo,
    string? Frase,
    string Descripcion,
    string? Tipo,
    List<BeneficioServicio> Beneficios,
    List<PasoProcesoServicio> Proceso,
    int Orden) : IRequest<int>;
