using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class TareaCasoRepository(SqlConnectionFactory connectionFactory) : ITareaCasoRepository
{
    private const string Columnas = "Id, CasoId, Descripcion, ResponsableUsuarioId, FechaVencimiento, Completada, FechaCreacion";

    public async Task<IReadOnlyList<TareaCaso>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.TareasCaso WHERE CasoId = @CasoId ORDER BY FechaVencimiento";
            var rows = await connection.QueryAsync<TareaCaso>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<IReadOnlyList<TareaCaso>> GetPendientesAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.TareasCaso WHERE Completada = 0 ORDER BY FechaVencimiento";
            var rows = await connection.QueryAsync<TareaCaso>(sql);
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(TareaCaso tarea)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.TareasCaso (CasoId, Descripcion, ResponsableUsuarioId, FechaVencimiento, Completada, FechaCreacion)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @Descripcion, @ResponsableUsuarioId, @FechaVencimiento, 0, @FechaCreacion)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, tarea);
        });
    }

    public async Task SetCompletadaAsync(int id, bool completada)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.TareasCaso SET Completada = @Completada WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Completada = completada });
        });
    }
}
