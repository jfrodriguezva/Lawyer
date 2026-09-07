using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class UsuarioRepository(SqlConnectionFactory connectionFactory) : IUsuarioRepository
{
    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Email, PasswordHash, Nombre, Rol
                FROM dbo.Usuarios
                WHERE Email = @Email
                """;

            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Email = email });
        });
    }
}
