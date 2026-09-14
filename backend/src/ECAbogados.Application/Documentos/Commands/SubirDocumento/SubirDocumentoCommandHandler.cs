using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Documentos.Commands.SubirDocumento;

public class SubirDocumentoCommandHandler(
    IDocumentoRepository documentoRepository,
    ICasoRepository casoRepository,
    IUsuarioRepository usuarioRepository,
    INotificacionRepository notificacionRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<SubirDocumentoCommand, int>
{
    public async Task<int> Handle(SubirDocumentoCommand request, CancellationToken cancellationToken)
    {
        var documento = new Documento
        {
            CasoId = request.CasoId,
            NombreArchivo = request.NombreArchivo,
            TipoContenido = request.TipoContenido,
            TamanoBytes = request.TamanoBytes,
            FechaCarga = DateTime.UtcNow,
            RutaAlmacenamiento = request.RutaAlmacenamiento,
            Descripcion = request.Descripcion,
            Visibilidad = request.Visibilidad ?? (request.SubidoPorTipo == OrigenDocumento.Cliente
                ? VisibilidadDocumento.SubidoPorCliente
                : VisibilidadDocumento.Interno),
            Estatus = EstatusDocumento.Recibido,
            SubidoPorTipo = request.SubidoPorTipo,
            SubidoPorId = request.SubidoPorId,
            SubidoPorNombre = request.SubidoPorNombre
        };

        var id = await documentoRepository.CreateAsync(documento);

        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", request.CasoId, $"Subió el documento: {request.NombreArchivo}");

        // Si lo subió el cliente, el despacho debe enterarse sin tener que
        // revisar el expediente manualmente.
        if (request.SubidoPorTipo == OrigenDocumento.Cliente)
        {
            var caso = await casoRepository.GetByIdAsync(request.CasoId);
            var responsables = await usuarioRepository.GetAllAsync();
            var destinatarios = caso?.AbogadoResponsableId is int abogadoId
                ? responsables.Where(u => u.Id == abogadoId)
                : responsables.Where(u => u.Activo && (u.Rol == Roles.Abogado || u.Rol == Roles.Administrador));

            foreach (var destinatario in destinatarios)
            {
                await notificacionRepository.CreateAsync(new Notificacion
                {
                    DestinatarioTipo = DestinatarioTipo.Usuario,
                    DestinatarioId = destinatario.Id,
                    Titulo = "El cliente subió un documento",
                    Mensaje = $"{request.SubidoPorNombre ?? "El cliente"} subió: {request.NombreArchivo}",
                    Fecha = DateTime.UtcNow,
                    Enlace = $"/casos/{request.CasoId}"
                });
            }
        }

        return id;
    }
}
