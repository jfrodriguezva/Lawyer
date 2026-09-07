using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class PlazoRepository(SqlConnectionFactory connectionFactory) : IPlazoRepository
{
    public async Task<IReadOnlyList<Plazo>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Descripcion, FechaLimite, Cumplido, AlertaEnviada
                FROM dbo.Plazos
                WHERE CasoId = @CasoId
                ORDER BY FechaLimite
                """;

            var rows = await connection.QueryAsync<Plazo>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<IReadOnlyList<Plazo>> GetProximosSinAlertaAsync(DateTime hasta)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Descripcion, FechaLimite, Cumplido, AlertaEnviada
                FROM dbo.Plazos
                WHERE Cumplido = 0 AND AlertaEnviada = 0 AND FechaLimite <= @Hasta
                """;

            var rows = await connection.QueryAsync<Plazo>(sql, new { Hasta = hasta });
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(Plazo plazo)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Plazos (CasoId, Descripcion, FechaLimite, Cumplido, AlertaEnviada)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @Descripcion, @FechaLimite, 0, 0)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, plazo);
        });
    }

    public async Task SetCumplidoAsync(int id, bool cumplido)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Plazos SET Cumplido = @Cumplido WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Cumplido = cumplido });
        });
    }

    public async Task MarkAlertaEnviadaAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Plazos SET AlertaEnviada = 1 WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id });
        });
    }
}
