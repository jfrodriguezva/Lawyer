using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using MediatR;

namespace ECAbogados.Application.Citas.Commands.CrearCita;

public class CrearCitaCommandHandler(ICitaRepository citaRepository) : IRequestHandler<CrearCitaCommand, int>
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

        return await citaRepository.CreateAsync(cita);
    }
}
