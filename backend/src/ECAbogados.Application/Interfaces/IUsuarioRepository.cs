using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
}
