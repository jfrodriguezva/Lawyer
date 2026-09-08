using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.Commands.CrearCita;

public class CrearCitaCommandHandler(
    ICitaRepository citaRepository,
    IStaffNotifier staffNotifier,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CrearCitaCommand, int>
{
    public async Task<int> Handle(CrearCitaCommand request, CancellationToken cancellationToken)
    {
        var cita = new Cita
        {
            CasoId = request.CasoId,
            NombreCliente = request.NombreCliente,
            Telefono = request.Telefono,
            FechaHora = request.FechaHora,
            Estatus = EstatusCita.Pendiente
        };

        var id = await citaRepository.CreateAsync(cita);

        await staffNotifier.NotifyAsync(
            "Nueva solicitud de cita",
            $"{request.NombreCliente} ({request.Telefono}) solicitó una cita para el {request.FechaHora:dd/MM/yyyy HH:mm}.",
            cancellationToken);

        if (request.CasoId is int casoId)
        {
            await auditoriaRepository.RegistrarAsync(currentUser, "Caso", casoId, $"Se agendó una cita para el {request.FechaHora:dd/MM/yyyy HH:mm}");
        }

        return id;
    }
}
