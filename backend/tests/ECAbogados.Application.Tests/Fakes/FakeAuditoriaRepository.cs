using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeAuditoriaRepository : IAuditoriaRepository
{
    public List<AuditoriaEntry> Entradas { get; } = [];
    private int _nextId = 1;

    public Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre, string? ip, string? userAgent)
    {
        Entradas.Add(new AuditoriaEntry
        {
            Id = _nextId++,
            Entidad = entidad,
            EntidadId = entidadId,
            Accion = accion,
            Detalle = detalle,
            UsuarioId = usuarioId,
            UsuarioNombre = usuarioNombre,
            Fecha = DateTime.UtcNow,
            Ip = ip,
            UserAgent = userAgent
        });
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<AuditoriaEntry>>(
            Entradas.Where(e => e.Entidad == "Caso" && e.EntidadId == casoId).ToList());

    public Task<(IReadOnlyList<AuditoriaEntry> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? entidad)
    {
        var filtradas = entidad is null ? Entradas : Entradas.Where(e => e.Entidad == entidad).ToList();
        var items = filtradas.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult<(IReadOnlyList<AuditoriaEntry>, int)>((items, filtradas.Count));
    }
}
