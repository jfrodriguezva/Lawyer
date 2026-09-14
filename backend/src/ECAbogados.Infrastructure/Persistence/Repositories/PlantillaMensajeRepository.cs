using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class PlantillaMensajeRepository(SqlConnectionFactory connectionFactory) : IPlantillaMensajeRepository
{
    public async Task<IReadOnlyList<PlantillaMensaje>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "SELECT Id, Nombre, Contenido FROM dbo.PlantillasMensaje ORDER BY Nombre";
            var rows = await connection.QueryAsync<PlantillaMensaje>(sql);
            return rows.ToList();
        });
    }

    public async Task<PlantillaMensaje?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "SELECT Id, Nombre, Contenido FROM dbo.PlantillasMensaje WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<PlantillaMensaje>(sql, new { Id = id });
        });
    }

    public async Task<int> CreateAsync(PlantillaMensaje plantilla)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.PlantillasMensaje (Nombre, Contenido)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Contenido)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, plantilla);
        });
    }

    public async Task UpdateAsync(PlantillaMensaje plantilla)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.PlantillasMensaje SET Nombre = @Nombre, Contenido = @Contenido WHERE Id = @Id";
            await connection.ExecuteAsync(sql, plantilla);
        });
    }

    public async Task DeleteAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "DELETE FROM dbo.PlantillasMensaje WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id });
        });
    }
}
