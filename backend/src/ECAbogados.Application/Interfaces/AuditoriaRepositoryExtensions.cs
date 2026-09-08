namespace ECAbogados.Application.Interfaces;

public static class AuditoriaRepositoryExtensions
{
    public static Task RegistrarAsync(
        this IAuditoriaRepository auditoriaRepository,
        ICurrentUserAccessor currentUser,
        string entidad,
        int entidadId,
        string accion,
        string? detalle = null) =>
        auditoriaRepository.RegistrarAsync(entidad, entidadId, accion, detalle, currentUser.UsuarioId, currentUser.Nombre ?? "Público (sin sesión)");
}
