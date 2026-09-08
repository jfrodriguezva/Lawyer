using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeAuditoriaRepository : IAuditoriaRepository
{
    public List<AuditoriaEntry> Entradas { get; } = [];
    private int _nextId = 1;

    public Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre)
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
            Fecha = DateTime.UtcNow
        });
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<AuditoriaEntry>>(
            Entradas.Where(e => e.Entidad == "Caso" && e.EntidadId == casoId).ToList());
}
