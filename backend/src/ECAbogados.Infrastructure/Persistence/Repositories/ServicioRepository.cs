using System.Text.Json;
using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ServicioRepository(SqlConnectionFactory connectionFactory) : IServicioRepository
{
    private const string Columnas = "Id, ModuloId, Slug, Titulo, Frase, Descripcion, Tipo, Beneficios, Proceso, Activo, Orden";

    // El JSON guardado en Beneficios/Proceso usa claves camelCase (mismo shape que
    // el frontend, y el de la migración desde servicios.ts). System.Text.Json es
    // case-sensitive por defecto y los records BeneficioServicio/PasoProcesoServicio
    // usan PascalCase -- sin esta opción, todo deserializa en null.
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private record ServicioRow(
        int Id, int ModuloId, string Slug, string Titulo, string? Frase, string Descripcion, string? Tipo,
        string Beneficios, string Proceso, bool Activo, int Orden);

    private static Servicio MapRow(ServicioRow row) => new()
    {
        Id = row.Id,
        ModuloId = row.ModuloId,
        Slug = row.Slug,
        Titulo = row.Titulo,
        Frase = row.Frase,
        Descripcion = row.Descripcion,
        Tipo = row.Tipo,
        Beneficios = JsonSerializer.Deserialize<List<BeneficioServicio>>(row.Beneficios, JsonOptions) ?? [],
        Proceso = JsonSerializer.Deserialize<List<PasoProcesoServicio>>(row.Proceso, JsonOptions) ?? [],
        Activo = row.Activo,
        Orden = row.Orden
    };

    public async Task<IReadOnlyList<Servicio>> GetAllAsync(int? moduloId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"""
                SELECT {Columnas} FROM dbo.Servicios
                WHERE (@ModuloId IS NULL OR ModuloId = @ModuloId)
                ORDER BY Orden, Titulo
                """;
            var rows = await connection.QueryAsync<ServicioRow>(sql, new { ModuloId = moduloId });
            return rows.Select(MapRow).ToList();
        });
    }

    public async Task<IReadOnlyList<Servicio>> GetActivosAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"""
                SELECT s.Id, s.ModuloId, s.Slug, s.Titulo, s.Frase, s.Descripcion, s.Tipo, s.Beneficios, s.Proceso, s.Activo, s.Orden
                FROM dbo.Servicios s
                INNER JOIN dbo.Modulos m ON m.Id = s.ModuloId
                WHERE s.Activo = 1 AND m.Activo = 1
                ORDER BY m.Orden, s.Orden, s.Titulo
                """;
            var rows = await connection.QueryAsync<ServicioRow>(sql);
            return rows.Select(MapRow).ToList();
        });
    }

    public async Task<Servicio?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Servicios WHERE Id = @Id";
            var row = await connection.QuerySingleOrDefaultAsync<ServicioRow>(sql, new { Id = id });
            return row is null ? null : MapRow(row);
        });
    }

    public async Task<int> CreateAsync(Servicio servicio)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Servicios (ModuloId, Slug, Titulo, Frase, Descripcion, Tipo, Beneficios, Proceso, Orden)
                OUTPUT INSERTED.Id
                VALUES (@ModuloId, @Slug, @Titulo, @Frase, @Descripcion, @Tipo, @Beneficios, @Proceso, @Orden)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                servicio.ModuloId,
                servicio.Slug,
                servicio.Titulo,
                servicio.Frase,
                servicio.Descripcion,
                servicio.Tipo,
                Beneficios = JsonSerializer.Serialize(servicio.Beneficios, JsonOptions),
                Proceso = JsonSerializer.Serialize(servicio.Proceso, JsonOptions),
                servicio.Orden
            });
        });
    }

    public async Task UpdateAsync(Servicio servicio)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = """
                UPDATE dbo.Servicios
                SET ModuloId = @ModuloId, Slug = @Slug, Titulo = @Titulo, Frase = @Frase,
                    Descripcion = @Descripcion, Tipo = @Tipo, Beneficios = @Beneficios,
                    Proceso = @Proceso, Orden = @Orden
                WHERE Id = @Id
                """;
            await connection.ExecuteAsync(sql, new
            {
                servicio.Id,
                servicio.ModuloId,
                servicio.Slug,
                servicio.Titulo,
                servicio.Frase,
                servicio.Descripcion,
                servicio.Tipo,
                Beneficios = JsonSerializer.Serialize(servicio.Beneficios, JsonOptions),
                Proceso = JsonSerializer.Serialize(servicio.Proceso, JsonOptions),
                servicio.Orden
            });
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Servicios SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }

    public async Task DeleteAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            using var transaction = connection.BeginTransaction();

            await connection.ExecuteAsync("DELETE FROM dbo.PromocionServicios WHERE ServicioId = @Id", new { Id = id }, transaction);
            await connection.ExecuteAsync("DELETE FROM dbo.Servicios WHERE Id = @Id", new { Id = id }, transaction);

            transaction.Commit();
        });
    }
}
