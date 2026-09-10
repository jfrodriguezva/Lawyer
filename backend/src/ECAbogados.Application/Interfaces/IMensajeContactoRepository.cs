using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IMensajeContactoRepository
{
    Task<IReadOnlyList<MensajeContacto>> GetAllAsync();
    Task<(IReadOnlyList<MensajeContacto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize);
    Task<int> CreateAsync(MensajeContacto mensaje);
    Task MarcarAtendidoAsync(int id);
}
