using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace ECAbogados.Infrastructure.Persistence;

public class SqlConnectionFactory(IConfiguration configuration)
{
    private readonly string _connectionString = configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Default'.");

    public async Task<IDbConnection> CreateOpenConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}
