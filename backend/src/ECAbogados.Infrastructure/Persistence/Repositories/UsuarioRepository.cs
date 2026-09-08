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
                SELECT Id, Email, PasswordHash, Nombre, Rol, Activo
                FROM dbo.Usuarios
                WHERE Email = @Email
                """;

            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Email = email });
        });
    }

    public async Task<IReadOnlyList<Usuario>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Email, PasswordHash, Nombre, Rol, Activo
                FROM dbo.Usuarios
                ORDER BY Nombre
                """;

            var rows = await connection.QueryAsync<Usuario>(sql);
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(Usuario usuario)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Usuarios (Email, PasswordHash, Nombre, Rol)
                OUTPUT INSERTED.Id
                VALUES (@Email, @PasswordHash, @Nombre, @Rol)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, usuario);
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Usuarios SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }
}
