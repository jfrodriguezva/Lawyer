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
                SELECT Id, CasoId, NombreCliente, Telefono, FechaHora, Estatus
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
                SELECT Id, CasoId, NombreCliente, Telefono, FechaHora, Estatus
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
                INSERT INTO dbo.Citas (CasoId, NombreCliente, Telefono, FechaHora, Estatus)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @NombreCliente, @Telefono, @FechaHora, @Estatus)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                cita.CasoId,
                cita.NombreCliente,
                cita.Telefono,
                cita.FechaHora,
                Estatus = cita.Estatus.ToString()
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

    private static Cita MapToEntity(CitaRow row) => new()
    {
        Id = row.Id,
        CasoId = row.CasoId,
        NombreCliente = row.NombreCliente,
        Telefono = row.Telefono,
        FechaHora = row.FechaHora,
        Estatus = Enum.Parse<EstatusCita>(row.Estatus)
    };

    private sealed class CitaRow
    {
        public int Id { get; init; }
        public int? CasoId { get; init; }
        public string NombreCliente { get; init; } = string.Empty;
        public string Telefono { get; init; } = string.Empty;
        public DateTime FechaHora { get; init; }
        public string Estatus { get; init; } = string.Empty;
    }
}
