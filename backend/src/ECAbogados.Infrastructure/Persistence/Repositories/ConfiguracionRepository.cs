using Dapper;
using ECAbogados.Application.Interfaces;

namespace ECAbogados.Infrastructure.Persistence.Repositories;

public class ConfiguracionRepository(SqlConnectionFactory connectionFactory) : IConfiguracionRepository
{
    public async Task<string?> GetValorAsync(string clave)
    {
        return await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();
            const string sql = "SELECT Valor FROM dbo.Configuracion WHERE Clave = @Clave";
            return await connection.QuerySingleOrDefaultAsync<string?>(sql, new { Clave = clave });
        });
    }

    public async Task SetValorAsync(string clave, string valor)
    {
        await ResiliencePolicies.SqlRetryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await connectionFactory.CreateOpenConnectionAsync();

            const string sql = """
                MERGE dbo.Configuracion AS target
                USING (SELECT @Clave AS Clave) AS source
                ON target.Clave = source.Clave
                WHEN MATCHED THEN UPDATE SET Valor = @Valor
                WHEN NOT MATCHED THEN INSERT (Clave, Valor) VALUES (@Clave, @Valor);
                """;

            await connection.ExecuteAsync(sql, new { Clave = clave, Valor = valor });
        });
    }
}
