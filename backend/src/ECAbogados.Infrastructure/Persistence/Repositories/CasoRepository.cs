using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class CasoRepository(SqlConnectionFactory connectionFactory) : ICasoRepository
{
    private const string Columnas = """
        Id, ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId,
        AbogadoResponsableId, Prioridad, FolioInterno, ContraparteNombre, AutoridadOrganismo,
        NumeroExpedienteExterno, FechaCierre, MotivoCierre, Archivado, MontoAcordado
        """;

    public async Task<IReadOnlyList<Caso>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var sql = $"SELECT {Columnas} FROM dbo.Casos ORDER BY FechaApertura DESC";

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
                SELECT {Columnas}
                FROM dbo.Casos
                {(tieneFiltro ? "WHERE ClienteNombre LIKE @Filtro OR Tipo LIKE @Filtro OR FolioInterno LIKE @Filtro" : "")}
                ORDER BY FechaApertura DESC
                OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY
                """;

            var countSql = $"""
                SELECT COUNT(*) FROM dbo.Casos
                {(tieneFiltro ? "WHERE ClienteNombre LIKE @Filtro OR Tipo LIKE @Filtro OR FolioInterno LIKE @Filtro" : "")}
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

            var sql = $"SELECT {Columnas} FROM dbo.Casos WHERE Id = @Id";

            var row = await connection.QuerySingleOrDefaultAsync<CasoRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<Caso?> GetByTokenAsync(string token)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var sql = $"SELECT {Columnas} FROM dbo.Casos WHERE TokenAcceso = @Token";

            var row = await connection.QuerySingleOrDefaultAsync<CasoRow>(sql, new { Token = token });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<IReadOnlyList<Caso>> GetByClienteIdAsync(int clienteId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var sql = $"SELECT {Columnas} FROM dbo.Casos WHERE ClienteId = @ClienteId ORDER BY FechaApertura DESC";

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
                INSERT INTO dbo.Casos (
                    ClienteNombre, Tipo, Estatus, FechaApertura, Notas, TokenAcceso, TokenGeneradoEn, ClienteId,
                    AbogadoResponsableId, Prioridad, FolioInterno, ContraparteNombre, AutoridadOrganismo, NumeroExpedienteExterno)
                OUTPUT INSERTED.Id
                VALUES (
                    @ClienteNombre, @Tipo, @Estatus, @FechaApertura, @Notas, @TokenAcceso, @TokenGeneradoEn, @ClienteId,
                    @AbogadoResponsableId, @Prioridad, @FolioInterno, @ContraparteNombre, @AutoridadOrganismo, @NumeroExpedienteExterno)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                caso.ClienteNombre,
                caso.Tipo,
                Estatus = caso.Estatus.ToString(),
                caso.FechaApertura,
                caso.Notas,
                caso.TokenAcceso,
                caso.TokenGeneradoEn,
                caso.ClienteId,
                caso.AbogadoResponsableId,
                caso.Prioridad,
                caso.FolioInterno,
                caso.ContraparteNombre,
                caso.AutoridadOrganismo,
                caso.NumeroExpedienteExterno
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
                    Notas = @Notas,
                    AbogadoResponsableId = @AbogadoResponsableId,
                    Prioridad = @Prioridad,
                    FolioInterno = @FolioInterno,
                    ContraparteNombre = @ContraparteNombre,
                    AutoridadOrganismo = @AutoridadOrganismo,
                    NumeroExpedienteExterno = @NumeroExpedienteExterno,
                    FechaCierre = @FechaCierre,
                    MotivoCierre = @MotivoCierre,
                    Archivado = @Archivado,
                    MontoAcordado = @MontoAcordado
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                caso.Id,
                caso.ClienteNombre,
                caso.Tipo,
                Estatus = caso.Estatus.ToString(),
                caso.Notas,
                caso.AbogadoResponsableId,
                caso.Prioridad,
                caso.FolioInterno,
                caso.ContraparteNombre,
                caso.AutoridadOrganismo,
                caso.NumeroExpedienteExterno,
                caso.FechaCierre,
                caso.MotivoCierre,
                caso.Archivado,
                caso.MontoAcordado
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
        ClienteId = row.ClienteId,
        AbogadoResponsableId = row.AbogadoResponsableId,
        Prioridad = row.Prioridad,
        FolioInterno = row.FolioInterno,
        ContraparteNombre = row.ContraparteNombre,
        AutoridadOrganismo = row.AutoridadOrganismo,
        NumeroExpedienteExterno = row.NumeroExpedienteExterno,
        FechaCierre = row.FechaCierre,
        MotivoCierre = row.MotivoCierre,
        Archivado = row.Archivado,
        MontoAcordado = row.MontoAcordado
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
        public int? AbogadoResponsableId { get; init; }
        public string? Prioridad { get; init; }
        public string? FolioInterno { get; init; }
        public string? ContraparteNombre { get; init; }
        public string? AutoridadOrganismo { get; init; }
        public string? NumeroExpedienteExterno { get; init; }
        public DateTime? FechaCierre { get; init; }
        public string? MotivoCierre { get; init; }
        public bool Archivado { get; init; }
        public decimal? MontoAcordado { get; init; }
    }
}
