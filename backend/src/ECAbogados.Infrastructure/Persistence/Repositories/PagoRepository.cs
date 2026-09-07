using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class PagoRepository(SqlConnectionFactory connectionFactory) : IPagoRepository
{
    public async Task<IReadOnlyList<Pago>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Concepto, Monto, Fecha
                FROM dbo.Pagos
                WHERE CasoId = @CasoId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<Pago>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(Pago pago)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Pagos (CasoId, Concepto, Monto, Fecha)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @Concepto, @Monto, @Fecha)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, pago);
        });
    }
}
