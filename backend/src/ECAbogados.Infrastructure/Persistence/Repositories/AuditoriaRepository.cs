using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class AuditoriaRepository(SqlConnectionFactory connectionFactory) : IAuditoriaRepository
{
    public async Task RegistrarAsync(string entidad, int entidadId, string accion, string? detalle, int? usuarioId, string? usuarioNombre)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Auditoria (Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre)
                VALUES (@Entidad, @EntidadId, @Accion, @Detalle, @UsuarioId, @UsuarioNombre)
                """;

            await connection.ExecuteAsync(sql, new { Entidad = entidad, EntidadId = entidadId, Accion = accion, Detalle = detalle, UsuarioId = usuarioId, UsuarioNombre = usuarioNombre });
        });
    }

    public async Task<IReadOnlyList<AuditoriaEntry>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, Entidad, EntidadId, Accion, Detalle, UsuarioId, UsuarioNombre, Fecha
                FROM dbo.Auditoria
                WHERE Entidad = 'Caso' AND EntidadId = @CasoId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<AuditoriaEntry>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }
}
