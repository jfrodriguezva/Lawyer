using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Citas.SolicitudesCita.Shared;

/// <summary>
/// Confirma una SolicitudCita creando la Cita real. La usan tanto el Abogado
/// (RevisarSolicitudCita, acción Aceptar) como el propio solicitante
/// (ResponderHorarioAlternativo, acción AceptarHorario): mismo chequeo de
/// horario duplicado, mismo efecto sobre la solicitud.
/// </summary>
public static class ConfirmacionCitaService
{
    /// <summary>
    /// Crea la Cita y actualiza el estatus de la solicitud EN MEMORIA. Quien
    /// llama es responsable de persistir la solicitud (con un solo UpdateAsync,
    /// junto con cualquier otro campo que también haya cambiado, como ResponsableUsuarioId).
    /// </summary>
    public static async Task ConfirmarAsync(
        ICitaRepository citaRepository,
        SolicitudCita solicitud)
    {
        if (await citaRepository.ExisteEnHorarioAsync(solicitud.FechaHoraPropuesta))
        {
            throw new ConflictException("Ya existe una cita confirmada en ese horario. Propón otro horario.");
        }

        var cita = new Cita
        {
            NombreCliente = solicitud.NombreSolicitante,
            Telefono = solicitud.TelefonoSolicitante,
            FechaHora = solicitud.FechaHoraPropuesta,
            Estatus = EstatusCita.Confirmada,
            ServicioInteres = solicitud.ServicioInteres
        };

        solicitud.CitaId = await citaRepository.CreateAsync(cita);
        solicitud.Estatus = EstatusSolicitudCita.Confirmada;
    }
}
