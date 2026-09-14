namespace ECAbogados.Domain.Entities;

public enum VisibilidadDocumento
{
    Interno,
    Compartido,
    SubidoPorCliente
}

public enum EstatusDocumento
{
    Pendiente,
    Recibido,
    EnRevision,
    Aceptado,
    Rechazado,
    RequiereCorreccion
}

/// <summary>Quién subió el documento: Usuario (staff) o Cliente.</summary>
public enum OrigenDocumento
{
    Staff,
    Cliente
}

public class Documento
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string TipoContenido { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
    public DateTime FechaCarga { get; set; }
    public string? RutaAlmacenamiento { get; set; }

    public string? Descripcion { get; set; }
    public string? Categoria { get; set; }
    public VisibilidadDocumento Visibilidad { get; set; } = VisibilidadDocumento.Interno;
    public EstatusDocumento Estatus { get; set; } = EstatusDocumento.Recibido;
    public string? ComentarioRevision { get; set; }
    public int Version { get; set; } = 1;
    public OrigenDocumento SubidoPorTipo { get; set; } = OrigenDocumento.Staff;
    public int? SubidoPorId { get; set; }
    public string? SubidoPorNombre { get; set; }

    // Modo "solo registro" (ver Configuracion): cuando es true, el documento no
    // tiene archivo físico en disco -- solo se deja constancia de que se
    // entregó por otro medio (correo/WhatsApp), para no depender de almacenar
    // el binario en el servidor.
    public bool SoloRegistro { get; set; }
}
