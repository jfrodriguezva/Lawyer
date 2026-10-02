using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class SolicitudCitaRepository(SqlConnectionFactory connectionFactory) : ISolicitudCitaRepository
{
    private const string Columnas = """
        Id, ProspectoId, ClienteId, NombreSolicitante, EmailSolicitante, TelefonoSolicitante, MedioContactoPreferido,
        Modulo, ServicioInteres, Descripcion, FechaHoraPropuesta, Modalidad, Estatus, ResponsableUsuarioId,
        Motivo, CitaId, FechaCreacion, TokenPublico
        """;

    public async Task<SolicitudCita?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.SolicitudesCita WHERE Id = @Id";
            var row = await connection.QuerySingleOrDefaultAsync<SolicitudCitaRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<SolicitudCita?> GetByTokenPublicoAsync(string token)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.SolicitudesCita WHERE TokenPublico = @Token";
            var row = await connection.QuerySingleOrDefaultAsync<SolicitudCitaRow>(sql, new { Token = token });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<IReadOnlyList<SolicitudCita>> GetAllAsync()
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.SolicitudesCita ORDER BY FechaCreacion DESC";
            var rows = await connection.QueryAsync<SolicitudCitaRow>(sql);
            return (IReadOnlyList<SolicitudCita>)rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<IReadOnlyList<SolicitudCita>> GetByProspectoIdAsync(int prospectoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.SolicitudesCita WHERE ProspectoId = @ProspectoId ORDER BY FechaCreacion DESC";
            var rows = await connection.QueryAsync<SolicitudCitaRow>(sql, new { ProspectoId = prospectoId });
            return (IReadOnlyList<SolicitudCita>)rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(SolicitudCita solicitud)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.SolicitudesCita (
                    ProspectoId, ClienteId, NombreSolicitante, EmailSolicitante, TelefonoSolicitante, MedioContactoPreferido,
                    Modulo, ServicioInteres, Descripcion, FechaHoraPropuesta, Modalidad, Estatus, FechaCreacion, TokenPublico)
                OUTPUT INSERTED.Id
                VALUES (
                    @ProspectoId, @ClienteId, @NombreSolicitante, @EmailSolicitante, @TelefonoSolicitante, @MedioContactoPreferido,
                    @Modulo, @ServicioInteres, @Descripcion, @FechaHoraPropuesta, @Modalidad, @Estatus, @FechaCreacion, @TokenPublico)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                solicitud.ProspectoId,
                solicitud.ClienteId,
                solicitud.NombreSolicitante,
                solicitud.EmailSolicitante,
                solicitud.TelefonoSolicitante,
                solicitud.MedioContactoPreferido,
                Modulo = solicitud.Modulo.ToString(),
                solicitud.ServicioInteres,
                solicitud.Descripcion,
                solicitud.FechaHoraPropuesta,
                Modalidad = solicitud.Modalidad.ToString(),
                Estatus = solicitud.Estatus.ToString(),
                solicitud.FechaCreacion,
                solicitud.TokenPublico
            });
        });
    }

    public async Task UpdateAsync(SolicitudCita solicitud)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.SolicitudesCita
                SET FechaHoraPropuesta = @FechaHoraPropuesta, Estatus = @Estatus, ResponsableUsuarioId = @ResponsableUsuarioId,
                    Motivo = @Motivo, CitaId = @CitaId
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new
            {
                solicitud.Id,
                solicitud.FechaHoraPropuesta,
                Estatus = solicitud.Estatus.ToString(),
                solicitud.ResponsableUsuarioId,
                solicitud.Motivo,
                solicitud.CitaId
            });
        });
    }

    public async Task AgregarHistorialAsync(HistorialCitaCambio historial)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.HistorialCitaCambios (SolicitudCitaId, FechaHoraPropuesta, PropuestoPor, Motivo, Fecha)
                VALUES (@SolicitudCitaId, @FechaHoraPropuesta, @PropuestoPor, @Motivo, @Fecha)
                """;

            await connection.ExecuteAsync(sql, new
            {
                historial.SolicitudCitaId,
                historial.FechaHoraPropuesta,
                PropuestoPor = historial.PropuestoPor.ToString(),
                historial.Motivo,
                historial.Fecha
            });
        });
    }

    public async Task<IReadOnlyList<HistorialCitaCambio>> GetHistorialAsync(int solicitudCitaId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, SolicitudCitaId, FechaHoraPropuesta, PropuestoPor, Motivo, Fecha
                FROM dbo.HistorialCitaCambios
                WHERE SolicitudCitaId = @SolicitudCitaId
                ORDER BY Fecha
                """;

            var rows = await connection.QueryAsync<HistorialRow>(sql, new { SolicitudCitaId = solicitudCitaId });
            return rows.Select(MapHistorial).ToList();
        });
    }

    // Una consulta por lote en vez de una por solicitud (N+1). Se parte en lotes
    // porque SQL Server acepta como máximo 2100 parámetros por comando y Dapper
    // expande "IN @Ids" a un parámetro por elemento.
    private const int TamanoLoteHistorial = 1000;

    public async Task<IReadOnlyDictionary<int, IReadOnlyList<HistorialCitaCambio>>> GetHistorialPorSolicitudesAsync(IReadOnlyCollection<int> solicitudCitaIds)
    {
        if (solicitudCitaIds.Count == 0)
        {
            return new Dictionary<int, IReadOnlyList<HistorialCitaCambio>>();
        }

        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, SolicitudCitaId, FechaHoraPropuesta, PropuestoPor, Motivo, Fecha
                FROM dbo.HistorialCitaCambios
                WHERE SolicitudCitaId IN @Ids
                ORDER BY Fecha
                """;

            var historial = new List<HistorialCitaCambio>();
            foreach (var lote in solicitudCitaIds.Distinct().Chunk(TamanoLoteHistorial))
            {
                var rows = await connection.QueryAsync<HistorialRow>(sql, new { Ids = lote });
                historial.AddRange(rows.Select(MapHistorial));
            }

            return (IReadOnlyDictionary<int, IReadOnlyList<HistorialCitaCambio>>)historial
                .GroupBy(h => h.SolicitudCitaId)
                .ToDictionary(g => g.Key, g => (IReadOnlyList<HistorialCitaCambio>)g.OrderBy(h => h.Fecha).ToList());
        });
    }

    public async Task<(int Total, IReadOnlyList<SolicitudCita> MasRecientes)> GetPendientesAsync(
        IReadOnlyCollection<EstatusSolicitudCita> estatusPendientes, ModuloSolicitud? modulo, int top)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var filtro = "WHERE Estatus IN @Estatus AND (@Modulo IS NULL OR Modulo = @Modulo)";
            var sql = $"""
                SELECT COUNT(1) FROM dbo.SolicitudesCita {filtro};
                SELECT TOP (@Top) {Columnas} FROM dbo.SolicitudesCita {filtro} ORDER BY FechaCreacion DESC;
                """;

            using var multi = await connection.QueryMultipleAsync(sql, new
            {
                Estatus = estatusPendientes.Select(e => e.ToString()).ToArray(),
                Modulo = modulo?.ToString(),
                Top = top
            });

            var total = await multi.ReadSingleAsync<int>();
            var rows = await multi.ReadAsync<SolicitudCitaRow>();
            return (total, (IReadOnlyList<SolicitudCita>)rows.Select(MapToEntity).ToList());
        });
    }

    private static HistorialCitaCambio MapHistorial(HistorialRow r) => new()
    {
        Id = r.Id,
        SolicitudCitaId = r.SolicitudCitaId,
        FechaHoraPropuesta = r.FechaHoraPropuesta,
        PropuestoPor = Enum.Parse<OrigenCambioCita>(r.PropuestoPor),
        Motivo = r.Motivo,
        Fecha = r.Fecha
    };

    private static SolicitudCita MapToEntity(SolicitudCitaRow row) => new()
    {
        Id = row.Id,
        ProspectoId = row.ProspectoId,
        ClienteId = row.ClienteId,
        NombreSolicitante = row.NombreSolicitante,
        EmailSolicitante = row.EmailSolicitante,
        TelefonoSolicitante = row.TelefonoSolicitante,
        MedioContactoPreferido = row.MedioContactoPreferido,
        Modulo = Enum.Parse<ModuloSolicitud>(row.Modulo),
        ServicioInteres = row.ServicioInteres,
        Descripcion = row.Descripcion,
        FechaHoraPropuesta = row.FechaHoraPropuesta,
        Modalidad = Enum.Parse<ModalidadCita>(row.Modalidad),
        Estatus = Enum.Parse<EstatusSolicitudCita>(row.Estatus),
        ResponsableUsuarioId = row.ResponsableUsuarioId,
        Motivo = row.Motivo,
        CitaId = row.CitaId,
        FechaCreacion = row.FechaCreacion,
        TokenPublico = row.TokenPublico
    };

    private sealed class SolicitudCitaRow
    {
        public int Id { get; init; }
        public int? ProspectoId { get; init; }
        public int? ClienteId { get; init; }
        public string NombreSolicitante { get; init; } = string.Empty;
        public string EmailSolicitante { get; init; } = string.Empty;
        public string TelefonoSolicitante { get; init; } = string.Empty;
        public string? MedioContactoPreferido { get; init; }
        public string Modulo { get; init; } = nameof(ModuloSolicitud.Abogado);
        public string? ServicioInteres { get; init; }
        public string? Descripcion { get; init; }
        public DateTime FechaHoraPropuesta { get; init; }
        public string Modalidad { get; init; } = nameof(ModalidadCita.Presencial);
        public string Estatus { get; init; } = nameof(EstatusSolicitudCita.SolicitudRecibida);
        public int? ResponsableUsuarioId { get; init; }
        public string? Motivo { get; init; }
        public int? CitaId { get; init; }
        public DateTime FechaCreacion { get; init; }
        public string TokenPublico { get; init; } = string.Empty;
    }

    private sealed class HistorialRow
    {
        public int Id { get; init; }
        public int SolicitudCitaId { get; init; }
        public DateTime FechaHoraPropuesta { get; init; }
        public string PropuestoPor { get; init; } = nameof(OrigenCambioCita.Staff);
        public string? Motivo { get; init; }
        public DateTime Fecha { get; init; }
    }
}
