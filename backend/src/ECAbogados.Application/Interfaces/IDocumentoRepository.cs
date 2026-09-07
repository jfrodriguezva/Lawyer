using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IDocumentoRepository
{
    Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId);
    Task<int> CreateAsync(Documento documento);
}
