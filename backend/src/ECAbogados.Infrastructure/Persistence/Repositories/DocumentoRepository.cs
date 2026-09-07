using Dapper;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class DocumentoRepository(SqlConnectionFactory connectionFactory) : IDocumentoRepository
{
    public async Task<IReadOnlyList<Documento>> GetByCasoIdAsync(int casoId)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                SELECT Id, CasoId, NombreArchivo, TipoContenido, TamanoBytes, FechaCarga, RutaAlmacenamiento
                FROM dbo.Documentos
                WHERE CasoId = @CasoId
                ORDER BY FechaCarga DESC
                """;

            var rows = await connection.QueryAsync<Documento>(sql, new { CasoId = casoId });
            return rows.ToList();
        });
    }

    public async Task<int> CreateAsync(Documento documento)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Documentos (CasoId, NombreArchivo, TipoContenido, TamanoBytes, FechaCarga, RutaAlmacenamiento)
                OUTPUT INSERTED.Id
                VALUES (@CasoId, @NombreArchivo, @TipoContenido, @TamanoBytes, @FechaCarga, @RutaAlmacenamiento)
                """;

            return await connection.ExecuteScalarAsync<int>(sql, documento);
        });
    }
}
