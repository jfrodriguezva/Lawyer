using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class RegistroTiempoRepository(SqlConnectionFactory connectionFactory) : IRegistroTiempoRepository
{
    private const string Columnas = "Id, CasoId, UsuarioId, UsuarioNombre, Minutos, Descripcion, Fecha";

    public async Task<IReadOnlyList<RegistroTiempo>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.RegistrosTiempo WHERE CasoId = @CasoId ORDER BY Fecha DESC";
            var rows = await connection.QueryAsync<RegistroTiempo>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<IReadOnlyList<RegistroTiempo>> GetAllAsync(DateTime? desde, DateTime? hasta)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var sql = $"""
                SELECT {Columnas} FROM dbo.RegistrosTiempo
                WHERE (@Desde IS NULL OR Fecha >= @Desde) AND (@Hasta IS NULL OR Fecha <= @Hasta)
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<RegistroTiempo>(sql, new { Desde = desde, Hasta = hasta });
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(RegistroTiempo registro)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.RegistrosTiempo (CasoId, UsuarioId, UsuarioNombre, Minutos, Descripcion, Fecha)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @UsuarioId, @UsuarioNombre, @Minutos, @Descripcion, @Fecha)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, registro);
        });
    }
}
