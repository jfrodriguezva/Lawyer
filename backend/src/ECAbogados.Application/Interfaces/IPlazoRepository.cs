using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IPlazoRepository
{
    Task<IReadOnlyList<Plazo>> GetByCasoIdAsync(int casoId);
    Task<IReadOnlyList<Plazo>> GetProximosSinAlertaAsync(DateTime hasta);
    Task<int> CreateAsync(Plazo plazo);
    Task SetCumplidoAsync(int id, bool cumplido);
    Task MarkAlertaEnviadaAsync(int id);
}
