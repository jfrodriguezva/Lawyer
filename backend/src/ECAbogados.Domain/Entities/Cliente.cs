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
    public string? Telefono { get; set; }
    public DateTime FechaCreacion { get; set; }
    public bool InvitacionPendiente { get; set; }
}
