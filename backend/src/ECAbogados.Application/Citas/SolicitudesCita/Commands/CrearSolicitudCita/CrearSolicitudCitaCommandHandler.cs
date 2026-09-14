using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.CrearSolicitudCita;

public class CrearSolicitudCitaCommandHandler(
    ISolicitudCitaRepository solicitudCitaRepository,
    IProspectoRepository prospectoRepository,
    IClienteRepository clienteRepository,
    IUsuarioRepository usuarioRepository,
    INotificacionRepository notificacionRepository,
    IStaffNotifier staffNotifier) : IRequestHandler<CrearSolicitudCitaCommand, CrearSolicitudCitaResult>
{
    public async Task<CrearSolicitudCitaResult> Handle(CrearSolicitudCitaCommand request, CancellationToken cancellationToken)
    {
        // Si el correo ya pertenece a un Cliente, la solicitud se asocia a esa
        // cuenta y no se crea un Prospecto (evita duplicar a la misma persona).
        var clienteExistente = await clienteRepository.GetByEmailAsync(request.EmailSolicitante);

        int? prospectoId = null;
        if (clienteExistente is null)
        {
            var prospecto = await prospectoRepository.GetByEmailAsync(request.EmailSolicitante);
            if (prospecto is null)
            {
                prospecto = new Prospecto
                {
                    Nombre = request.NombreSolicitante,
                    Email = request.EmailSolicitante,
                    Telefono = request.TelefonoSolicitante,
                    MedioContactoPreferido = request.MedioContactoPreferido,
                    Origen = "Sitio web",
                    ServicioInteres = request.ServicioInteres,
                    FechaCreacion = DateTime.UtcNow
                };
                prospectoId = await prospectoRepository.CreateAsync(prospecto);
            }
            else
            {
                prospectoId = prospecto.Id;
            }
        }

        var solicitud = new SolicitudCita
        {
            ProspectoId = prospectoId,
            ClienteId = clienteExistente?.Id,
            NombreSolicitante = request.NombreSolicitante,
            EmailSolicitante = request.EmailSolicitante,
            TelefonoSolicitante = request.TelefonoSolicitante,
            MedioContactoPreferido = request.MedioContactoPreferido,
            Modulo = request.Modulo,
            ServicioInteres = request.ServicioInteres,
            Descripcion = request.Descripcion,
            FechaHoraPropuesta = request.FechaHoraPropuesta,
            Modalidad = request.Modalidad,
            Estatus = EstatusSolicitudCita.SolicitudRecibida,
            FechaCreacion = DateTime.UtcNow,
            TokenPublico = Guid.NewGuid().ToString("N"),
            AceptoAvisoPrivacidad = request.AceptoAvisoPrivacidad,
            FechaConsentimiento = request.AceptoAvisoPrivacidad ? DateTime.UtcNow : null
        };

        var id = await solicitudCitaRepository.CreateAsync(solicitud);

        await staffNotifier.NotifyAsync(
            "Nueva solicitud de cita",
            $"{request.NombreSolicitante} ({request.TelefonoSolicitante}) solicitó una cita de {request.Modulo} " +
            $"para el {request.FechaHoraPropuesta:dd/MM/yyyy HH:mm} ({request.Modalidad}).",
            cancellationToken);

        // Notificación in-app para quien atiende este módulo: Abogado para
        // asuntos jurídicos, Consultor para SAT; Administrador ve ambos siempre.
        var rolDelModulo = request.Modulo == ModuloSolicitud.SAT ? Roles.Consultor : Roles.Abogado;
        var responsables = await usuarioRepository.GetAllAsync();
        foreach (var responsable in responsables.Where(u => u.Activo && (u.Rol == rolDelModulo || u.Rol == Roles.Administrador)))
        {
            await notificacionRepository.CreateAsync(new Notificacion
            {
                DestinatarioTipo = DestinatarioTipo.Usuario,
                DestinatarioId = responsable.Id,
                Titulo = "Nueva solicitud de cita",
                Mensaje = $"{request.NombreSolicitante} solicitó una cita para el {request.FechaHoraPropuesta:dd/MM/yyyy HH:mm}.",
                Fecha = DateTime.UtcNow,
                Enlace = "/solicitudes"
            });
        }

        return new CrearSolicitudCitaResult(id, solicitud.TokenPublico);
    }
}
