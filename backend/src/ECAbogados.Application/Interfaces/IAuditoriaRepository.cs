using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IAuditoriaRepository
{
    Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre, string? ip, string? userAgent);
    Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId);
    Task<(IReadOnlyList<AuditoriaEntry> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? entidad);
}
