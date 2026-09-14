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
                SELECT Id, CasoId, Concepto, Monto, Fecha, Tipo
                FROM dbo.Pagos
                WHERE CasoId = @CasoId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<PagoRow>(sql, new { CasoId = casoId });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(Pago pago)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Pagos (CasoId, Concepto, Monto, Fecha, Tipo)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @Concepto, @Monto, @Fecha, @Tipo)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                pago.CasoId,
                pago.Concepto,
                pago.Monto,
                pago.Fecha,
                Tipo = pago.Tipo.ToString()
            });
        });
    }

    private static Pago MapToEntity(PagoRow row) => new()
    {
        Id = row.Id,
        CasoId = row.CasoId,
        Concepto = row.Concepto,
        Monto = row.Monto,
        Fecha = row.Fecha,
        Tipo = Enum.Parse<TipoPago>(row.Tipo)
    };

    private sealed class PagoRow
    {
        public int Id { get; init; }
        public int CasoId { get; init; }
        public string Concepto { get; init; } = string.Empty;
        public decimal Monto { get; init; }
        public DateTime Fecha { get; init; }
        public string Tipo { get; init; } = nameof(TipoPago.Pago);
    }
}
