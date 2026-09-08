using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ChecklistItemRepository(SqlConnectionFactory connectionFactory) : IChecklistItemRepository
{
    public async Task<ChecklistItem?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Descripcion, Completado
                FROM dbo.ChecklistItems
                WHERE Id = @Id
                """;

            return await connection.QuerySingleOrDefaultAsync<ChecklistItem>(sql, new { Id = id });
        });
    }

    public async Task<IReadOnlyList<ChecklistItem>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, Descripcion, Completado
                FROM dbo.ChecklistItems
                WHERE CasoId = @CasoId
                ORDER BY Id
                """;

            var rows = await connection.QueryAsync<ChecklistItem>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task CreateManyAsync(int casoId, IEnumerable<string> descripciones)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.ChecklistItems (CasoId, Descripcion, Completado)
                VALUES (@CasoId, @Descripcion, 0)
                """;

            var parametros = descripciones.Select(d => new { CasoId = casoId, Descripcion = d });
            await connection.ExecuteAsync(sql, parametros);
        });
    }

    public async Task SetCompletadoAsync(int id, bool completado)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.ChecklistItems
                SET Completado = @Completado
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, Completado = completado });
        });
    }
}
