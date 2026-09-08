using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IAuditoriaRepository
{
    Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre);
    Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId);
}
