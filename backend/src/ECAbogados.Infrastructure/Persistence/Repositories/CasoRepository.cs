using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class CasoRepository(SqlConnectionFactory connectionFactory) : ICasoRepository
{
    public async Task<IReadOnlyList<Caso>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn
                FROM dbo.Casos
                ORDER BY FechaApertura DESC
                """;

            var rows = await connection.QueryAsync<CasoRow>(sql);
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<Caso?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn
                FROM dbo.Casos
                WHERE Id = @Id
                """;

            var row = await connection.QuerySingleOrDefaultAsync<CasoRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<Caso?> GetByTokenAsync(string token)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn
                FROM dbo.Casos
                WHERE TokenAcceso = @Token
                """;

            var row = await connection.QuerySingleOrDefaultAsync<CasoRow>(sql, new { Token = token });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<int> CreateAsync(Caso caso)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Casos (ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn)
                OUTPUT INSERTED.Id
                VALUES (@ClienteNombre, @Tipo, @Estatus, @FechaApertura, @Notas, @TokenAcceso, @TokenGeneradoEn)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                caso.ClienteNombre,
                caso.Tipo,
                Estatus = caso.Estatus.ToString(),
                caso.FechaApertura,
                caso.Notas,
                caso.TokenAcceso,
                caso.TokenGeneradoEn
            });
        });
    }

    public async Task UpdateAsync(Caso caso)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Casos
                SET ClienteNombre = @ClienteNombre,
                    Tipo = @Tipo,
                    Estatus = @Estatus,
                    Notas = @Notas
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                caso.Id,
                caso.ClienteNombre,
                caso.Tipo,
                Estatus = caso.Estatus.ToString(),
                caso.Notas
            });
        });
    }

    private static Caso MapToEntity(CasoRow row) => new()
    {
        Id = row.Id,
        ClienteNombre = row.ClienteNombre,
        Tipo = row.Tipo,
        Estatus = Enum.Parse<EstatusCaso>(row.Estatus),
        FechaApertura = row.FechaApertura,
        Notas = row.Notas,
        TokenAcceso = row.TokenAcceso,
        TokenGeneradoEn = row.TokenGeneradoEn
    };

    private sealed class CasoRow
    {
        public int Id { get; init; }
        public string ClienteNombre { get; init; } = string.Empty;
        public string Tipo { get; init; } = string.Empty;
        public string Estatus { get; init; } = string.Empty;
        public DateTime FechaApertura { get; init; }
        public string? Notas { get; init; }
        public string? TokenAcceso { get; init; }
        public DateTime? TokenGeneradoEn { get; init; }
    }
}
