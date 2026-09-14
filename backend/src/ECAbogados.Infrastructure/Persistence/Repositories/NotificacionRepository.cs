using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class NotificacionRepository(SqlConnectionFactory connectionFactory) : INotificacionRepository
{
    public async Task<int> CreateAsync(Notificacion notificacion)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Notificaciones (DestinatarioTipo, DestinatarioId, Titulo, Mensaje, Leida, Fecha, Enlace)
                OUTPUT INSERTED.Id
                VALUES (@DestinatarioTipo, @DestinatarioId, @Titulo, @Mensaje, 0, @Fecha, @Enlace)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                DestinatarioTipo = notificacion.DestinatarioTipo.ToString(),
                notificacion.DestinatarioId,
                notificacion.Titulo,
                notificacion.Mensaje,
                notificacion.Fecha,
                notificacion.Enlace
            });
        });
    }

    public async Task<IReadOnlyList<Notificacion>> GetByDestinatarioAsync(DestinatarioTipo tipo, int destinatarioId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, DestinatarioTipo, DestinatarioId, Titulo, Mensaje, Leida, Fecha, Enlace
                FROM dbo.Notificaciones
                WHERE DestinatarioTipo = @DestinatarioTipo AND DestinatarioId = @DestinatarioId
                ORDER BY Fecha DESC
                """;

            var rows = await connection.QueryAsync<NotificacionRow>(sql, new { DestinatarioTipo = tipo.ToString(), DestinatarioId = destinatarioId });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> ContarNoLeidasAsync(DestinatarioTipo tipo, int destinatarioId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT COUNT(*) FROM dbo.Notificaciones
                WHERE DestinatarioTipo = @DestinatarioTipo AND DestinatarioId = @DestinatarioId AND Leida = 0
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new { DestinatarioTipo = tipo.ToString(), DestinatarioId = destinatarioId });
        });
    }

    public async Task MarcarLeidaAsync(int id)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Notificaciones SET Leida = 1 WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id });
        });
    }

    public async Task MarcarTodasLeidasAsync(DestinatarioTipo tipo, int destinatarioId)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Notificaciones SET Leida = 1
                WHERE DestinatarioTipo = @DestinatarioTipo AND DestinatarioId = @DestinatarioId AND Leida = 0
                """;

            await connection.ExecuteAsync(sql, new { DestinatarioTipo = tipo.ToString(), DestinatarioId = destinatarioId });
        });
    }

    private static Notificacion MapToEntity(NotificacionRow row) => new()
    {
        Id = row.Id,
        DestinatarioTipo = Enum.Parse<DestinatarioTipo>(row.DestinatarioTipo),
        DestinatarioId = row.DestinatarioId,
        Titulo = row.Titulo,
        Mensaje = row.Mensaje,
        Leida = row.Leida,
        Fecha = row.Fecha,
        Enlace = row.Enlace
    };

    private sealed class NotificacionRow
    {
        public int Id { get; init; }
        public string DestinatarioTipo { get; init; } = nameof(Domain.Entities.DestinatarioTipo.Usuario);
        public int DestinatarioId { get; init; }
        public string Titulo { get; init; } = string.Empty;
        public string Mensaje { get; init; } = string.Empty;
        public bool Leida { get; init; }
        public DateTime Fecha { get; init; }
        public string? Enlace { get; init; }
    }
}
