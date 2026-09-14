using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ProspectoRepository(SqlConnectionFactory connectionFactory) : IProspectoRepository
{
    private const string Columnas = """
        Id, Nombre, Email, Telefono, MedioContactoPreferido, Origen, ServicioInteres, ConflictoInteres,
        ResponsableUsuarioId, ResultadoEntrevista, Etapa, MotivoNoContratacion, ClienteId, FechaCreacion
        """;

    public async Task<Prospecto?> GetByEmailAsync(string email)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Prospectos WHERE Email = @Email";
            var row = await connection.QuerySingleOrDefaultAsync<ProspectoRow>(sql, new { Email = email });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<Prospecto?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Prospectos WHERE Id = @Id";
            var row = await connection.QuerySingleOrDefaultAsync<ProspectoRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<IReadOnlyList<Prospecto>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Prospectos ORDER BY FechaCreacion DESC";
            var rows = await connection.QueryAsync<ProspectoRow>(sql);
            return (IReadOnlyList<Prospecto>)rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(Prospecto prospecto)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Prospectos (Nombre, Email, Telefono, MedioContactoPreferido, Origen, ServicioInteres, ConflictoInteres, FechaCreacion)
                OUTPUT INSERTED.Id
                VALUES (@Nombre, @Email, @Telefono, @MedioContactoPreferido, @Origen, @ServicioInteres, @ConflictoInteres, @FechaCreacion)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                prospecto.Nombre,
                prospecto.Email,
                prospecto.Telefono,
                prospecto.MedioContactoPreferido,
                prospecto.Origen,
                prospecto.ServicioInteres,
                ConflictoInteres = prospecto.ConflictoInteres.ToString(),
                prospecto.FechaCreacion
            });
        });
    }

    public async Task UpdateAsync(Prospecto prospecto)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Prospectos
                SET Nombre = @Nombre, Telefono = @Telefono, MedioContactoPreferido = @MedioContactoPreferido,
                    ConflictoInteres = @ConflictoInteres, ResponsableUsuarioId = @ResponsableUsuarioId,
                    ResultadoEntrevista = @ResultadoEntrevista, Etapa = @Etapa,
                    MotivoNoContratacion = @MotivoNoContratacion, ClienteId = @ClienteId
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                prospecto.Id,
                prospecto.Nombre,
                prospecto.Telefono,
                prospecto.MedioContactoPreferido,
                ConflictoInteres = prospecto.ConflictoInteres.ToString(),
                prospecto.ResponsableUsuarioId,
                prospecto.ResultadoEntrevista,
                Etapa = prospecto.Etapa.ToString(),
                prospecto.MotivoNoContratacion,
                prospecto.ClienteId
            });
        });
    }

    public async Task VincularClienteAsync(int prospectoId, int clienteId)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "UPDATE dbo.Prospectos SET ClienteId = @ClienteId WHERE Id = @ProspectoId";
            await connection.ExecuteAsync(sql, new { ProspectoId = prospectoId, ClienteId = clienteId });
        });
    }

    private static Prospecto MapToEntity(ProspectoRow row) => new()
    {
        Id = row.Id,
        Nombre = row.Nombre,
        Email = row.Email,
        Telefono = row.Telefono,
        MedioContactoPreferido = row.MedioContactoPreferido,
        Origen = row.Origen,
        ServicioInteres = row.ServicioInteres,
        ConflictoInteres = Enum.Parse<EstatusConflictoInteres>(row.ConflictoInteres),
        ResponsableUsuarioId = row.ResponsableUsuarioId,
        ResultadoEntrevista = row.ResultadoEntrevista,
        Etapa = Enum.Parse<EtapaProspecto>(row.Etapa),
        MotivoNoContratacion = row.MotivoNoContratacion,
        ClienteId = row.ClienteId,
        FechaCreacion = row.FechaCreacion
    };

    private sealed class ProspectoRow
    {
        public int Id { get; init; }
        public string Nombre { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Telefono { get; init; } = string.Empty;
        public string? MedioContactoPreferido { get; init; }
        public string? Origen { get; init; }
        public string? ServicioInteres { get; init; }
        public string ConflictoInteres { get; init; } = nameof(EstatusConflictoInteres.Pendiente);
        public int? ResponsableUsuarioId { get; init; }
        public string? ResultadoEntrevista { get; init; }
        public string Etapa { get; init; } = nameof(EtapaProspecto.Nuevo);
        public string? MotivoNoContratacion { get; init; }
        public int? ClienteId { get; init; }
        public DateTime FechaCreacion { get; init; }
    }
}
