using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class CatalogoTramiteSATRepository(SqlConnectionFactory connectionFactory) : ICatalogoTramiteSATRepository
{
    private const string Columnas = "Id, Nombre, Requisitos, Etapas, Observaciones, Activo";

    public async Task<IReadOnlyList<CatalogoTramiteSAT>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.CatalogoTramitesSAT ORDER BY Nombre";
            var rows = await connection.QueryAsync<CatalogoTramiteSAT>(sql);
            return rows.ToList();
        });
    }

    public async Task<CatalogoTramiteSAT?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.CatalogoTramitesSAT WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<CatalogoTramiteSAT>(sql, new { Id = id });
        });
    }

    public async Task<int> CreateAsync(CatalogoTramiteSAT tramite)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.CatalogoTramitesSAT (Nombre, Requisitos, Etapas, Observaciones, Activo)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Requisitos, @Etapas, @Observaciones, 1)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, tramite);
        });
    }

    public async Task UpdateAsync(CatalogoTramiteSAT tramite)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.CatalogoTramitesSAT
                SET Nombre = @Nombre, Requisitos = @Requisitos, Etapas = @Etapas, Observaciones = @Observaciones
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, tramite);
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.CatalogoTramitesSAT SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }
}
