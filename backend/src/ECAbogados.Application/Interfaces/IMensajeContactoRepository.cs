using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IMensajeContactoRepository
{
    Task<IReadOnlyList<MensajeContacto>> GetAllAsync();
    Task<int> CreateAsync(MensajeContacto mensaje);
    Task MarcarAtendidoAsync(int id);
}
