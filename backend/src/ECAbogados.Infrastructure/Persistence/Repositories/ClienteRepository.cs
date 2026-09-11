using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ClienteRepository(SqlConnectionFactory connectionFactory) : IClienteRepository
{
    public async Task<Cliente?> GetByEmailAsync(string email)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Email, PasswordHash, Nombre, Activo, IntentosFallidos, BloqueadoHasta, ResetToken, ResetTokenExpira
                FROM dbo.Clientes
                WHERE Email = @Email
                """;

            return await connection.QuerySingleOrDefaultAsync<Cliente>(sql, new { Email = email });
        });
    }

    public async Task<Cliente?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Email, PasswordHash, Nombre, Activo, IntentosFallidos, BloqueadoHasta, ResetToken, ResetTokenExpira
                FROM dbo.Clientes
                WHERE Id = @Id
                """;

            return await connection.QuerySingleOrDefaultAsync<Cliente>(sql, new { Id = id });
        });
    }

    public async Task<IReadOnlyList<Cliente>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Email, PasswordHash, Nombre, Activo, IntentosFallidos, BloqueadoHasta, ResetToken, ResetTokenExpira
                FROM dbo.Clientes
                ORDER BY Nombre
                """;

            var rows = await connection.QueryAsync<Cliente>(sql);
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(Cliente cliente)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Clientes (Email, PasswordHash, Nombre)
                OUTPUT INSERTED.Id
                VALUES (@Email, @PasswordHash, @Nombre)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, cliente);
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Clientes SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }

    public async Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Clientes
                SET IntentosFallidos = @IntentosFallidos, BloqueadoHasta = @BloqueadoHasta
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, IntentosFallidos = intentosFallidos, BloqueadoHasta = bloqueadoHasta });
        });
    }
}
