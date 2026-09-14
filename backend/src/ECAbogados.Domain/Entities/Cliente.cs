namespace ECAbogados.Domain.Entities;

public enum TipoPersona
{
    Fisica,
    Moral
}

public class Cliente : ICuentaSegura
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueadoHasta { get; set; }
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpira { get; set; }

    public TipoPersona TipoPersona { get; set; } = TipoPersona.Fisica;
    public string? Rfc { get; set; }
    // Datos fiscales adicionales (razón social, domicilio fiscal, régimen, etc.):
    // pendiente de que el despacho defina qué campos necesita capturar. Se deja
    // este campo libre para no inventar una estructura fiscal no confirmada.
    public string? DatosFiscalesPendientes { get; set; }
    public string? Telefono { get; set; }
    public DateTime FechaCreacion { get; set; }
    public bool InvitacionPendiente { get; set; }
}
