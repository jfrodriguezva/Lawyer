using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class MensajeContactoRepository(SqlConnectionFactory connectionFactory) : IMensajeContactoRepository
{
    public async Task<IReadOnlyList<MensajeContacto>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Nombre, Telefono, Email, Mensaje, FechaEnvio, Atendido
                FROM dbo.MensajesContacto
                ORDER BY FechaEnvio DESC
                """;

            var rows = await connection.QueryAsync<MensajeContacto>(sql);
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(MensajeContacto mensaje)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.MensajesContacto (Nombre, Telefono, Email, Mensaje, FechaEnvio, Atendido)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Telefono, @Email, @Mensaje, @FechaEnvio, @Atendido)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, mensaje);
        });
    }

    public async Task MarcarAtendidoAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.MensajesContacto
                SET Atendido = 1
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id });
        });
    }
}
