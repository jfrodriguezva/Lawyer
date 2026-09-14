using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class AuditoriaRepository(SqlConnectionFactory connectionFactory) : IAuditoriaRepository
{
    public async Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre, string? ip, string? userAgent)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Auditoria (Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre, Ip, UserAgent)
                VALUES (@Entidad, @EntidadId, @Accion, @Detalle, @UsuarioId, @UsuarioNombre, @Ip, @UserAgent)
                """;

            await connection.ExecuteAsync(sql, new
            {
                Entidad = entidad,
                EntidadId = entidadId,
                Accion = accion,
                Detalle = detalle,
                UsuarioId = usuarioId,
                UsuarioNombre = usuarioNombre,
                Ip = ip,
                UserAgent = userAgent
            });
        });
    }

    public async Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre, Fecha, Ip, UserAgent
                FROM dbo.Auditoria
                WHERE Entidad = 'Caso' AND EntidadId = @CasoId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<AuditoriaEntry>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<(IReadOnlyList<AuditoriaEntry> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? entidad)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var tieneFiltro = !string.IsNullOrWhiteSpace(entidad);

            var sql = $"""
                SELECT Id, Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre, Fecha, Ip, UserAgent
                FROM dbo.Auditoria
                {(tieneFiltro ? "WHERE Entidad = @Entidad" : "")}
                ORDER BY Fecha DESC
                OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY
                """;

            var countSql = $"""
                SELECT COUNT(*) FROM dbo.Auditoria
                {(tieneFiltro ? "WHERE Entidad = @Entidad" : "")}
                """;

            var parametros = new { Entidad = entidad, Skip = (page - 1) * pageSize, PageSize = pageSize };

            var rows = await connection.QueryAsync<AuditoriaEntry>(sql, parametros);
            var total = await connection.ExecuteScalarAsync<int>(countSql, parametros);

            return ((IReadOnlyList<AuditoriaEntry>)rows.ToList(), total);
        });
    }
}
