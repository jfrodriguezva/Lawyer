using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IDocumentoRepository
{
    Task<Documento?> GetByIdAsync(int id);
    Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId);
    Task<int> CreateAsync(Documento documento);
    Task ActualizarEstatusAsync(int id, EstatusDocumento estatus, string? comentarioRevision);
}
