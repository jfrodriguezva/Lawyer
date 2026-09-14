using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

/// <summary>
/// Un solo lugar para construir cada DTO desde su entidad: antes cada query
/// handler repetía el mismo `new DocumentoDto(d.Id, d.CasoId, ...)` a mano.
/// </summary>
public static class DtoMappers
{
    public static DocumentoDto ToDto(this Documento d) => new(
        d.Id, d.CasoId, d.NombreArchivo, d.TipoContenido, d.TamanoBytes, d.FechaCarga,
        d.Descripcion, d.Categoria, d.Visibilidad, d.Estatus, d.ComentarioRevision, d.Version,
        d.SubidoPorTipo, d.SubidoPorNombre, d.SoloRegistro);

    public static CitaDto ToDto(this Cita c) =>
        new(c.Id, c.CasoId, c.NombreCliente, c.Telefono, c.FechaHora, c.Estatus, c.ServicioInteres);

    public static ChecklistItemDto ToDto(this ChecklistItem c) =>
        new(c.Id, c.CasoId, c.Descripcion, c.Completado);

    public static ActualizacionCasoDto ToDto(this ActualizacionCaso a) =>
        new(a.Id, a.CasoId, a.Texto, a.Visibilidad, a.UsuarioNombre, a.Fecha);

    public static ProspectoDto ToDto(this Prospecto p) => new(
        p.Id, p.Nombre, p.Email, p.Telefono, p.MedioContactoPreferido, p.Origen, p.ServicioInteres,
        p.ConflictoInteres, p.ResponsableUsuarioId, p.ResultadoEntrevista, p.Etapa, p.MotivoNoContratacion,
        p.ClienteId, p.FechaCreacion);

    public static ClienteDto ToDto(this Cliente c) =>
        new(c.Id, c.Email, c.Nombre, c.Activo, c.TipoPersona, c.Rfc, c.Telefono, c.InvitacionPendiente, c.FechaCreacion);

    public static HistorialCitaCambioDto ToDto(this HistorialCitaCambio h) =>
        new(h.Id, h.FechaHoraPropuesta, h.PropuestoPor, h.Motivo, h.Fecha);

    public static SolicitudCitaDto ToDto(this SolicitudCita s, IReadOnlyList<HistorialCitaCambio> historial) => new(
        s.Id, s.ProspectoId, s.ClienteId, s.NombreSolicitante, s.EmailSolicitante, s.TelefonoSolicitante,
        s.MedioContactoPreferido, s.Modulo, s.ServicioInteres, s.Descripcion, s.FechaHoraPropuesta, s.Modalidad,
        s.Estatus, s.ResponsableUsuarioId, s.Motivo, s.CitaId, s.FechaCreacion,
        historial.Select(h => h.ToDto()).ToList());

    public static SolicitudCitaPublicaDto ToPublicaDto(this SolicitudCita s) =>
        new(s.NombreSolicitante, s.Modulo, s.ServicioInteres, s.FechaHoraPropuesta, s.Modalidad, s.Estatus, s.Motivo);
}
