using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeDocumentoRepository : IDocumentoRepository
{
    private readonly List<Documento> _documentos = [];
    private int _nextId = 1;

    public Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<Documento>>(_documentos.Where(d => d.CasoId == casoId).ToList());

    public Task<int> CreateAsync(Documento documento)
    {
        documento.Id = _nextId++;
        _documentos.Add(documento);
        return Task.FromResult(documento.Id);
    }
}
