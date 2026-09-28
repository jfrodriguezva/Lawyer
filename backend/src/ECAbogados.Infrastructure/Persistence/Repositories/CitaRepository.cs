using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class CitaRepository(SqlConnectionFactory connectionFactory) : ICitaRepository
{
    public async Task<IReadOnlyList<Cita>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, NombreCliente, Telefono, FechaHora, Estatus, RecordatorioEnviado, ServicioInteres
                FROM dbo.Citas
                ORDER BY FechaHora
                """;

            var rows = await connection.QueryAsync<CitaRow>(sql);
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<Cita?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, NombreCliente, Telefono, FechaHora, Estatus, RecordatorioEnviado, ServicioInteres
                FROM dbo.Citas
                WHERE Id = @Id
                """;

            var row = await connection.QuerySingleOrDefaultAsync<CitaRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<int> CreateAsync(Cita cita)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Citas (CasoId, NombreCliente, Telefono, FechaHora, Estatus, ServicioInteres)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @NombreCliente, @Telefono, @FechaHora, @Estatus, @ServicioInteres)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                cita.CasoId,
                cita.NombreCliente,
                cita.Telefono,
                cita.FechaHora,
                Estatus = cita.Estatus.ToString(),
                cita.ServicioInteres
            });
        });
    }

    public async Task UpdateEstatusAsync(int id, EstatusCita estatus)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Citas
                SET Estatus = @Estatus
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, Estatus = estatus.ToString() });
        });
    }

    public async Task<bool> ExisteEnHorarioAsync(DateTime fechaHora)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT COUNT(1) FROM dbo.Citas
                WHERE FechaHora = @FechaHora AND Estatus = @Estatus
                """;

            var count = await connection.ExecuteScalarAsync<int>(sql, new { FechaHora = fechaHora, Estatus = EstatusCita.Confirmada.ToString() });
            return count > 0;
        });
    }

    public async Task<IReadOnlyList<Cita>> GetProximasAsync(DateTime desde, int top)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT TOP (@Top) Id, CasoId, NombreCliente, Telefono, FechaHora, Estatus, RecordatorioEnviado, ServicioInteres
                FROM dbo.Citas
                WHERE FechaHora >= @Desde AND Estatus <> @Cancelada
                ORDER BY FechaHora
                """;

            var rows = await connection.QueryAsync<CitaRow>(sql, new { Top = top, Desde = desde, Cancelada = EstatusCita.Cancelada.ToString() });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<(int Total, int Confirmadas)> GetConteoConfirmadasAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT COUNT(1) AS Total,
                       COALESCE(SUM(CASE WHEN Estatus = @Confirmada THEN 1 ELSE 0 END), 0) AS Confirmadas
                FROM dbo.Citas
                """;

            return await connection.QuerySingleAsync<(int Total, int Confirmadas)>(sql, new { Confirmada = EstatusCita.Confirmada.ToString() });
        });
    }

    public async Task MarkRecordatorioEnviadoAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = "UPDATE dbo.Citas SET RecordatorioEnviado = 1 WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id });
        });
    }

    private static Cita MapToEntity(CitaRow row) => new()
    {
        Id = row.Id,
        CasoId = row.CasoId,
        NombreCliente = row.NombreCliente,
        Telefono = row.Telefono,
        FechaHora = row.FechaHora,
        Estatus = Enum.Parse<EstatusCita>(row.Estatus),
        RecordatorioEnviado = row.RecordatorioEnviado,
        ServicioInteres = row.ServicioInteres
    };

    private sealed class CitaRow
    {
        public int Id { get; init; }
        public int? CasoId { get; init; }
        public string NombreCliente { get; init; } = string.Empty;
        public string Telefono { get; init; } = string.Empty;
        public DateTime FechaHora { get; init; }
        public string Estatus { get; init; } = string.Empty;
        public bool RecordatorioEnviado { get; init; }
        public string? ServicioInteres { get; init; }
    }
}
