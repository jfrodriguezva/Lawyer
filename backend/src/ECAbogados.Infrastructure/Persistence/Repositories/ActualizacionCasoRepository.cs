using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ActualizacionCasoRepository(SqlConnectionFactory connectionFactory) : IActualizacionCasoRepository
{
    public async Task<IReadOnlyList<ActualizacionCaso>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Texto, Visibilidad, UsuarioId, UsuarioNombre, Fecha
                FROM dbo.ActualizacionesCaso
                WHERE CasoId = @CasoId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<ActualizacionRow>(sql, new { CasoId = casoId });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(ActualizacionCaso actualizacion)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.ActualizacionesCaso (CasoId, Texto, Visibilidad, UsuarioId, UsuarioNombre, Fecha)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @Texto, @Visibilidad, @UsuarioId, @UsuarioNombre, @Fecha)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                actualizacion.CasoId,
                actualizacion.Texto,
                Visibilidad = actualizacion.Visibilidad.ToString(),
                actualizacion.UsuarioId,
                actualizacion.UsuarioNombre,
                actualizacion.Fecha
            });
        });
    }

    private static ActualizacionCaso MapToEntity(ActualizacionRow row) => new()
    {
        Id = row.Id,
        CasoId = row.CasoId,
        Texto = row.Texto,
        Visibilidad = Enum.Parse<VisibilidadActualizacion>(row.Visibilidad),
        UsuarioId = row.UsuarioId,
        UsuarioNombre = row.UsuarioNombre,
        Fecha = row.Fecha
    };

    private sealed class ActualizacionRow
    {
        public int Id { get; init; }
        public int CasoId { get; init; }
        public string Texto { get; init; } = string.Empty;
        public string Visibilidad { get; init; } = nameof(VisibilidadActualizacion.Interna);
        public int UsuarioId { get; init; }
        public string? UsuarioNombre { get; init; }
        public DateTime Fecha { get; init; }
    }
}
