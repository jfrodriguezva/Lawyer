using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class DocumentoRepository(SqlConnectionFactory connectionFactory) : IDocumentoRepository
{
    private const string Columnas = """
        Id, CasoId, NombreArchivo, TipoContenido, TamanoBytes, FechaCarga, RutaAlmacenamiento,
        Descripcion, Categoria, Visibilidad, Estatus, ComentarioRevision, Version, SubidoPorTipo,
        SubidoPorId, SubidoPorNombre, SoloRegistro
        """;

    public async Task<Documento?> GetByIdAsync(int id)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            var sql = $"SELECT {Columnas} FROM dbo.Documentos WHERE Id = @Id";
            var row = await connection.QuerySingleOrDefaultAsync<DocumentoRow>(sql, new { Id = id });
            return row is null ? null : MapToEntity(row);
        });
    }

    public async Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            var sql = $"SELECT {Columnas} FROM dbo.Documentos WHERE CasoId = @CasoId ORDER BY FechaCarga DESC";

            var rows = await connection.QueryAsync<DocumentoRow>(sql, new { CasoId = casoId });
            return rows.Select(MapToEntity).ToList();
        });
    }

    public async Task<int> CreateAsync(Documento documento)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Documentos (
                    CasoId, NombreArchivo, TipoContenido, TamanoBytes, FechaCarga, RutaAlmacenamiento,
                    Descripcion, Categoria, Visibilidad, Estatus, ComentarioRevision, Version, SubidoPorTipo,
                    SubidoPorId, SubidoPorNombre, SoloRegistro)
                OUTPUT INSERTED.Id
                VALUES (
                    @CasoId, @NombreArchivo, @TipoContenido, @TamanoBytes, @FechaCarga, @RutaAlmacenamiento,
                    @Descripcion, @Categoria, @Visibilidad, @Estatus, @ComentarioRevision, @Version, @SubidoPorTipo,
                    @SubidoPorId, @SubidoPorNombre, @SoloRegistro)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, new
            {
                documento.CasoId,
                documento.NombreArchivo,
                documento.TipoContenido,
                documento.TamanoBytes,
                documento.FechaCarga,
                documento.RutaAlmacenamiento,
                documento.Descripcion,
                documento.Categoria,
                Visibilidad = documento.Visibilidad.ToString(),
                Estatus = documento.Estatus.ToString(),
                documento.ComentarioRevision,
                documento.Version,
                SubidoPorTipo = documento.SubidoPorTipo.ToString(),
                documento.SubidoPorId,
                documento.SubidoPorNombre,
                documento.SoloRegistro
            });
        });
    }

    public async Task ActualizarEstatusAsync(int id, EstatusDocumento estatus, string? comentarioRevision)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.Documentos
                SET Estatus = @Estatus, ComentarioRevision = @ComentarioRevision
                WHERE Id = @Id
                """;

            await connection.ExecuteAsync(sql, new { Id = id, Estatus = estatus.ToString(), ComentarioRevision = comentarioRevision });
        });
    }

    private static Documento MapToEntity(DocumentoRow row) => new()
    {
        Id = row.Id,
        CasoId = row.CasoId,
        NombreArchivo = row.NombreArchivo,
        TipoContenido = row.TipoContenido,
        TamanoBytes = row.TamanoBytes,
        FechaCarga = row.FechaCarga,
        RutaAlmacenamiento = row.RutaAlmacenamiento,
        Descripcion = row.Descripcion,
        Categoria = row.Categoria,
        Visibilidad = Enum.Parse<VisibilidadDocumento>(row.Visibilidad),
        Estatus = Enum.Parse<EstatusDocumento>(row.Estatus),
        ComentarioRevision = row.ComentarioRevision,
        Version = row.Version,
        SubidoPorTipo = Enum.Parse<OrigenDocumento>(row.SubidoPorTipo),
        SubidoPorId = row.SubidoPorId,
        SubidoPorNombre = row.SubidoPorNombre,
        SoloRegistro = row.SoloRegistro
    };

    private sealed class DocumentoRow
    {
        public int Id { get; init; }
        public int CasoId { get; init; }
        public string NombreArchivo { get; init; } = string.Empty;
        public string TipoContenido { get; init; } = string.Empty;
        public long TamanoBytes { get; init; }
        public DateTime FechaCarga { get; init; }
        public string? RutaAlmacenamiento { get; init; }
        public string? Descripcion { get; init; }
        public string? Categoria { get; init; }
        public string Visibilidad { get; init; } = nameof(VisibilidadDocumento.Interno);
        public string Estatus { get; init; } = nameof(EstatusDocumento.Recibido);
        public string? ComentarioRevision { get; init; }
        public int Version { get; init; } = 1;
        public string SubidoPorTipo { get; init; } = nameof(OrigenDocumento.Staff);
        public int? SubidoPorId { get; init; }
        public string? SubidoPorNombre { get; init; }
        public bool SoloRegistro { get; init; }
    }
}
