using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ModuloRepository(SqlConnectionFactory connectionFactory) : IModuloRepository
{
    private const string Columnas = "Id, Nombre, Slug, RolResponsable, Activo, Orden";

    public async Task<IReadOnlyList<Modulo>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Modulos ORDER BY Orden, Nombre";
            var rows = await connection.QueryAsync<Modulo>(sql);
            return rows.ToList();
        });
    }

    public async Task<Modulo?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Modulos WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Modulo>(sql, new { Id = id });
        });
    }

    public async Task<int> CreateAsync(Modulo modulo)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Modulos (Nombre, Slug, RolResponsable, Orden)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Slug, @RolResponsable, @Orden)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, modulo);
        });
    }

    public async Task UpdateAsync(Modulo modulo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = """
                UPDATE dbo.Modulos
                SET Nombre = @Nombre, Slug = @Slug, RolResponsable = @RolResponsable, Orden = @Orden
                WHERE Id = @Id
                """;
            await connection.ExecuteAsync(sql, modulo);
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Modulos SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }

    public async Task DeleteConServiciosAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            using var transaction = connection.BeginTransaction();

            const string borrarVinculosPromocion = """
                DELETE ps FROM dbo.PromocionServicios ps
                INNER JOIN dbo.Servicios s ON s.Id = ps.ServicioId
                WHERE s.ModuloId = @ModuloId
                """;
            await connection.ExecuteAsync(borrarVinculosPromocion, new { ModuloId = id }, transaction);

            await connection.ExecuteAsync("DELETE FROM dbo.Servicios WHERE ModuloId = @ModuloId", new { ModuloId = id }, transaction);
            await connection.ExecuteAsync("DELETE FROM dbo.Modulos WHERE Id = @Id", new { Id = id }, transaction);

            transaction.Commit();
        });
    }
}
