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
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId
                FROM dbo.Casos
                ORDER BY FechaApertura DESC
                """;

            var rows = await connection.QueryAsync<CasoRow>(sql);
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<(IReadOnlyList<Caso> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var tieneFiltro = !string.IsNullOrWhiteSpace(search);
            var filtro = tieneFiltro ? $"%{search}%" : null;

            var sql = $"""
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId
                FROM dbo.Casos
                {(tieneFiltro ? "WHERE ClienteNombre LIKE @Filtro OR Tipo LIKE @Filtro" : "")}
                ORDER BY FechaApertura DESC
                OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY
                """;

            var countSql = $"""
                SELECT COUNT(*) FROM dbo.Casos
                {(tieneFiltro ? "WHERE ClienteNombre LIKE @Filtro OR Tipo LIKE @Filtro" : "")}
                """;

            var parametros = new { Filtro = filtro, Skip = (page - 1) * pageSize, PageSize = pageSize };

            var rows = await connection.QueryAsync<CasoRow>(sql, parametros);
            var total = await connection.ExecuteScalarAsync<int>(countSql, parametros);

            return ((IReadOnlyList<Caso>)rows.Select(MapToEntity).ToList(), total);
        });
    }

    public async Task<Caso?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId
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
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId
                FROM dbo.Casos
                WHERE TokenAcceso = @Token
                """;

            var row = await connection.QuerySingleOrDefaultAsync<CasoRow>(sql, new { Token = token });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<IReadOnlyList<Caso>> GetByClienteIdAsync(int clienteId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId
                FROM dbo.Casos
                WHERE ClienteId = @ClienteId
                ORDER BY FechaApertura DESC
                """;

            var rows = await connection.QueryAsync<CasoRow>(sql, new { ClienteId = clienteId });
            return rows.Select(MapToEntity).ToList();
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

    public async Task<string> RegenerarTokenAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var nuevoToken = Guid.NewGuid().ToString("N");

            const string sql = """
                UPDATE dbo.Casos
                SET TokenAcceso = @TokenAcceso, TokenGeneradoEn = @TokenGeneradoEn
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                TokenAcceso = nuevoToken,
                TokenGeneradoEn = DateTime.UtcNow
            });

            return nuevoToken;
        });
    }

    public async Task VincularClienteAsync(int casoId, int clienteId)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Casos SET ClienteId = @ClienteId WHERE Id = @CasoId";
            await connection.ExecuteAsync(sql, new { CasoId = casoId, ClienteId = clienteId });
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
        TokenGeneradoEn = row.TokenGeneradoEn,
        ClienteId = row.ClienteId
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
        public int? ClienteId { get; init; }
    }
}
