using Microsoft.Data.SqlClient;
using Polly;

namespace ECAbogados.Infrastructure.Persistence;

public static class ResiliencePolicies
{
    public static readonly IAsyncPolicy SqlRetryPolicy = Policy
        .Handle<SqlException>()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromMilliseconds(200 * Math.Pow(2, retryAttempt)));
}
