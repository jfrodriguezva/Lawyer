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
                SELECT Id, Nombre, Telefono, Email, Mensaje, FechaEnvio, Atendido, ServicioInteres
                FROM dbo.MensajesContacto
                ORDER BY FechaEnvio DESC
                """;

            var rows = await connection.QueryAsync<MensajeContacto>(sql);
            return rows.ToList();
        });
    }

    public async Task<(IReadOnlyList<MensajeContacto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Nombre, Telefono, Email, Mensaje, FechaEnvio, Atendido, ServicioInteres
                FROM dbo.MensajesContacto
                ORDER BY FechaEnvio DESC
                OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY
                """;

            const string countSql = "SELECT COUNT(*) FROM dbo.MensajesContacto";

            var parametros = new { Skip = (page - 1) * pageSize, PageSize = pageSize };

            var rows = await connection.QueryAsync<MensajeContacto>(sql, parametros);
            var total = await connection.ExecuteScalarAsync<int>(countSql);

            return ((IReadOnlyList<MensajeContacto>)rows.ToList(), total);
        });
    }

    public async Task<int> CreateAsync(MensajeContacto mensaje)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.MensajesContacto (Nombre, Telefono, Email, Mensaje, FechaEnvio, Atendido, ServicioInteres)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Telefono, @Email, @Mensaje, @FechaEnvio, @Atendido, @ServicioInteres)
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
