using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class PromocionRepository(SqlConnectionFactory connectionFactory) : IPromocionRepository
{
    private const string Columnas = "Id, Texto, NombreArchivo, TipoContenido, RutaAlmacenamiento, Activo";

    private async Task<List<Promocion>> CargarServicioIdsAsync(System.Data.IDbConnection connection, List<Promocion> promociones)
    {
        if (promociones.Count == 0)
        {
            return promociones;
        }

        const string sql = "SELECT PromocionId, ServicioId FROM dbo.PromocionServicios WHERE PromocionId IN @Ids";
        var vinculos = await connection.QueryAsync<(int PromocionId, int ServicioId)>(sql, new { Ids = promociones.Select(p => p.Id) });
        var porPromocion = vinculos.ToLookup(v => v.PromocionId, v => v.ServicioId);

        foreach (var promocion in promociones)
        {
            promocion.ServicioIds = porPromocion[promocion.Id].ToList();
        }

        return promociones;
    }

    public async Task<IReadOnlyList<Promocion>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Promociones ORDER BY Id DESC";
            var rows = (await connection.QueryAsync<Promocion>(sql)).ToList();
            return (IReadOnlyList<Promocion>)await CargarServicioIdsAsync(connection, rows);
        });
    }

    public async Task<IReadOnlyList<Promocion>> GetActivasAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Promociones WHERE Activo = 1 ORDER BY Id DESC";
            var rows = (await connection.QueryAsync<Promocion>(sql)).ToList();
            return (IReadOnlyList<Promocion>)await CargarServicioIdsAsync(connection, rows);
        });
    }

    public async Task<Promocion?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Promociones WHERE Id = @Id";
            var promocion = await connection.QuerySingleOrDefaultAsync<Promocion>(sql, new { Id = id });
            if (promocion is null)
            {
                return null;
            }

            const string sqlVinculos = "SELECT ServicioId FROM dbo.PromocionServicios WHERE PromocionId = @Id";
            var servicioIds = await connection.QueryAsync<int>(sqlVinculos, new { Id = id });
            promocion.ServicioIds = servicioIds.ToList();
            return promocion;
        });
    }

    public async Task<int> CreateAsync(Promocion promocion)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            using var transaction = connection.BeginTransaction();

            const string sqlInsertar = """
                INSERT INTO dbo.Promociones (Texto, NombreArchivo, TipoContenido, RutaAlmacenamiento)
                OUTPUT INSERTED.Id
                VALUES (@Texto, @NombreArchivo, @TipoContenido, @RutaAlmacenamiento)
                """;
            var id = await connection.ExecuteScalarAsync<int>(sqlInsertar, promocion, transaction);

            const string sqlVincular = "INSERT INTO dbo.PromocionServicios (PromocionId, ServicioId) VALUES (@PromocionId, @ServicioId)";
            await connection.ExecuteAsync(sqlVincular, promocion.ServicioIds.Select(servicioId => new { PromocionId = id, ServicioId = servicioId }), transaction);

            transaction.Commit();
            return id;
        });
    }

    public async Task UpdateAsync(Promocion promocion)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            using var transaction = connection.BeginTransaction();

            const string sqlActualizar = """
                UPDATE dbo.Promociones
                SET Texto = @Texto, NombreArchivo = @NombreArchivo, TipoContenido = @TipoContenido,
                    RutaAlmacenamiento = @RutaAlmacenamiento
                WHERE Id = @Id
                """;
            await connection.ExecuteAsync(sqlActualizar, promocion, transaction);

            await connection.ExecuteAsync("DELETE FROM dbo.PromocionServicios WHERE PromocionId = @Id", new { promocion.Id }, transaction);

            const string sqlVincular = "INSERT INTO dbo.PromocionServicios (PromocionId, ServicioId) VALUES (@PromocionId, @ServicioId)";
            await connection.ExecuteAsync(sqlVincular, promocion.ServicioIds.Select(servicioId => new { PromocionId = promocion.Id, ServicioId = servicioId }), transaction);

            transaction.Commit();
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Promociones SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }

    public async Task DeleteAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            using var transaction = connection.BeginTransaction();

            await connection.ExecuteAsync("DELETE FROM dbo.PromocionServicios WHERE PromocionId = @Id", new { Id = id }, transaction);
            await connection.ExecuteAsync("DELETE FROM dbo.Promociones WHERE Id = @Id", new { Id = id }, transaction);

            transaction.Commit();
        });
    }
}
