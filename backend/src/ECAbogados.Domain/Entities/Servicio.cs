namespace ECAbogados.Domain.Entities;

/// <summary>
/// Servicio publicado en el sitio (antes hardcodeado en el frontend, en
/// lib/servicios.ts). Pertenece a un Modulo. Beneficios y Proceso se guardan
/// como JSON en dbo.Servicios y el repositorio los serializa/deserializa a
/// estas listas tipadas.
/// </summary>
public class Servicio
{
    public int Id { get; set; }
    public int ModuloId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Frase { get; set; }
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Debe coincidir con el tipo de expediente usado en Casos (checklist
    /// automático, ver Application/Casos/RequisitosPorTipo.cs) si se quiere
    /// que ese servicio dispare el checklist al abrir un caso. Si no coincide,
    /// simplemente no se dispara — no es una integridad referencial forzada.
    /// </summary>
    public string? Tipo { get; set; }

    public List<BeneficioServicio> Beneficios { get; set; } = [];
    public List<PasoProcesoServicio> Proceso { get; set; } = [];
    public bool Activo { get; set; } = true;
    public int Orden { get; set; }
}

public record BeneficioServicio(string Icono, string Titulo, string Texto);

public record PasoProcesoServicio(string Numero, string Titulo, string Texto);
