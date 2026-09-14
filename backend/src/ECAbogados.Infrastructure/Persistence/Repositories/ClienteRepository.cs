using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ClienteRepository(SqlConnectionFactory connectionFactory) : IClienteRepository
{
    private const string Columnas = """
        Id, Email, PasswordHash, Nombre, Activo, IntentosFallidos, BloqueadoHasta, ResetToken, ResetTokenExpira,
        TipoPersona, Rfc, DatosFiscalesPendientes, Telefono, FechaCreacion, InvitacionPendiente
        """;

    public async Task<Cliente?> GetByEmailAsync(string email)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Clientes WHERE Email = @Email";
            return await connection.QuerySingleOrDefaultAsync<ClienteRow>(sql, new { Email = email }) is { } row ? MapToEntity(row) : null;
        });
    }

    public async Task<Cliente?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Clientes WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<ClienteRow>(sql, new { Id = id }) is { } row ? MapToEntity(row) : null;
        });
    }

    public async Task<IReadOnlyList<Cliente>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Clientes ORDER BY Nombre";
            var rows = await connection.QueryAsync<ClienteRow>(sql);
            return (IReadOnlyList<Cliente>)rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(Cliente cliente)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Clientes (Email, PasswordHash, Nombre, TipoPersona, Rfc, DatosFiscalesPendientes, Telefono, FechaCreacion, InvitacionPendiente)
                OUTPUT INSERTED.Id
                VALUES (@Email, @PasswordHash, @Nombre, @TipoPersona, @Rfc, @DatosFiscalesPendientes, @Telefono, @FechaCreacion, @InvitacionPendiente)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                cliente.Email,
                cliente.PasswordHash,
                cliente.Nombre,
                TipoPersona = cliente.TipoPersona.ToString(),
                cliente.Rfc,
                cliente.DatosFiscalesPendientes,
                cliente.Telefono,
                FechaCreacion = cliente.FechaCreacion == default ? DateTime.UtcNow : cliente.FechaCreacion,
                cliente.InvitacionPendiente
            });
        });
    }

    public async Task SetActivoAsync(int id, bool activo)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Clientes SET Activo = @Activo WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
        });
    }

    public async Task UpdateSeguridadLoginAsync(int id, int intentosFallidos, DateTime? bloqueadoHasta)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Clientes
                SET IntentosFallidos = @IntentosFallidos, BloqueadoHasta = @BloqueadoHasta
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, IntentosFallidos = intentosFallidos, BloqueadoHasta = bloqueadoHasta });
        });
    }

    public async Task<Cliente?> GetByResetTokenAsync(string resetToken)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Clientes WHERE ResetToken = @ResetToken";
            return await connection.QuerySingleOrDefaultAsync<ClienteRow>(sql, new { ResetToken = resetToken }) is { } row ? MapToEntity(row) : null;
        });
    }

    public async Task SetResetTokenAsync(int id, string? resetToken, DateTime? resetTokenExpira)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Clientes
                SET ResetToken = @ResetToken, ResetTokenExpira = @ResetTokenExpira, InvitacionPendiente = 0
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, ResetToken = resetToken, ResetTokenExpira = resetTokenExpira });
        });
    }

    public async Task UpdatePasswordHashAsync(int id, string passwordHash)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Clientes SET PasswordHash = @PasswordHash, InvitacionPendiente = 0 WHERE Id = @Id";
            await connection.ExecuteAsync(sql, new { Id = id, PasswordHash = passwordHash });
        });
    }

    private static Cliente MapToEntity(ClienteRow row) => new()
    {
        Id = row.Id,
        Email = row.Email,
        PasswordHash = row.PasswordHash,
        Nombre = row.Nombre,
        Activo = row.Activo,
        IntentosFallidos = row.IntentosFallidos,
        BloqueadoHasta = row.BloqueadoHasta,
        ResetToken = row.ResetToken,
        ResetTokenExpira = row.ResetTokenExpira,
        TipoPersona = Enum.Parse<TipoPersona>(row.TipoPersona),
        Rfc = row.Rfc,
        DatosFiscalesPendientes = row.DatosFiscalesPendientes,
        Telefono = row.Telefono,
        FechaCreacion = row.FechaCreacion,
        InvitacionPendiente = row.InvitacionPendiente
    };

    private sealed class ClienteRow
    {
        public int Id { get; init; }
        public string Email { get; init; } = string.Empty;
        public string PasswordHash { get; init; } = string.Empty;
        public string Nombre { get; init; } = string.Empty;
        public bool Activo { get; init; }
        public int IntentosFallidos { get; init; }
        public DateTime? BloqueadoHasta { get; init; }
        public string? ResetToken { get; init; }
        public DateTime? ResetTokenExpira { get; init; }
        public string TipoPersona { get; init; } = nameof(Domain.Entities.TipoPersona.Fisica);
        public string? Rfc { get; init; }
        public string? DatosFiscalesPendientes { get; init; }
        public string? Telefono { get; init; }
        public DateTime FechaCreacion { get; init; }
        public bool InvitacionPendiente { get; init; }
    }
}
