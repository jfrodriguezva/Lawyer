namespace ECAbogados.Application.Interfaces;

public interface IConfiguracionRepository
{
    Task<string?> GetValorAsync(string clave);
    Task SetValorAsync(string clave, string valor);
}
