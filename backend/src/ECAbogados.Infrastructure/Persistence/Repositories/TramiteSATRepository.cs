using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class TramiteSATRepository(SqlConnectionFactory connectionFactory) : ITramiteSATRepository
{
    private const string Columnas = "Id, ClienteId, CatalogoTramiteId, Estatus, ResponsableUsuarioId, FechaLimite, Observaciones, FechaCreacion";

    public async Task<IReadOnlyList<TramiteSAT>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.TramitesSAT ORDER BY FechaCreacion DESC";
            var rows = await connection.QueryAsync<TramiteSATRow>(sql);
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<IReadOnlyList<TramiteSAT>> GetByClienteIdAsync(int clienteId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.TramitesSAT WHERE ClienteId = @ClienteId ORDER BY FechaCreacion DESC";
            var rows = await connection.QueryAsync<TramiteSATRow>(sql, new { ClienteId = clienteId });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<TramiteSAT?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.TramitesSAT WHERE Id = @Id";
            var row = await connection.QuerySingleOrDefaultAsync<TramiteSATRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<int> CreateAsync(TramiteSAT tramite)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.TramitesSAT (ClienteId, CatalogoTramiteId, Estatus, ResponsableUsuarioId, FechaLimite, Observaciones, FechaCreacion)
                OUTPUT INSERTED.Id
                VALUES (@ClienteId, @CatalogoTramiteId, @Estatus, @ResponsableUsuarioId, @FechaLimite, @Observaciones, @FechaCreacion)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                tramite.ClienteId,
                tramite.CatalogoTramiteId,
                Estatus = tramite.Estatus.ToString(),
                tramite.ResponsableUsuarioId,
                tramite.FechaLimite,
                tramite.Observaciones,
                tramite.FechaCreacion
            });
        });
    }

    public async Task UpdateAsync(TramiteSAT tramite)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.TramitesSAT
                SET Estatus = @Estatus, ResponsableUsuarioId = @ResponsableUsuarioId,
                    FechaLimite = @FechaLimite, Observaciones = @Observaciones
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                tramite.Id,
                Estatus = tramite.Estatus.ToString(),
                tramite.ResponsableUsuarioId,
                tramite.FechaLimite,
                tramite.Observaciones
            });
        });
    }

    private static TramiteSAT MapToEntity(TramiteSATRow row) => new()
    {
        Id = row.Id,
        ClienteId = row.ClienteId,
        CatalogoTramiteId = row.CatalogoTramiteId,
        Estatus = Enum.Parse<EstatusTramiteSAT>(row.Estatus),
        ResponsableUsuarioId = row.ResponsableUsuarioId,
        FechaLimite = row.FechaLimite,
        Observaciones = row.Observaciones,
        FechaCreacion = row.FechaCreacion
    };

    private sealed class TramiteSATRow
    {
        public int Id { get; init; }
        public int ClienteId { get; init; }
        public int CatalogoTramiteId { get; init; }
        public string Estatus { get; init; } = nameof(EstatusTramiteSAT.Pendiente);
        public int? ResponsableUsuarioId { get; init; }
        public DateTime? FechaLimite { get; init; }
        public string? Observaciones { get; init; }
        public DateTime FechaCreacion { get; init; }
    }
}
