using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeDocumentoRepository : IDocumentoRepository
{
    private readonly List<Documento> _documentos = [];
    private int _nextId = 1;

    public Task<Documento?> GetByIdAsync(int id) =>
        Task.FromResult(_documentos.FirstOrDefault(d => d.Id == id));

    public Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId) =>
        Task.FromResult<IReadOnlyList<Documento>>(_documentos.Where(d => d.CasoId == casoId).ToList());

    public Task<int> CreateAsync(Documento documento)
    {
        documento.Id = _nextId++;
        _documentos.Add(documento);
        return Task.FromResult(documento.Id);
    }

    public Task ActualizarEstatusAsync(int id, EstatusDocumento estatus, string? comentarioRevision)
    {
        var documento = _documentos.First(d => d.Id == id);
        documento.Estatus = estatus;
        documento.ComentarioRevision = comentarioRevision;
        return Task.CompletedTask;
    }
}
