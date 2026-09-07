using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using MediatR;

namespace ECAbogados.Application.Casos.Commands.CrearCaso;

public class CrearCasoCommandHandler(ICasoRepository casoRepository) : IRequestHandler<CrearCasoCommand, int>
{
    public async Task<int> Handle(CrearCasoCommand request, CancellationToken cancellationToken)
    {
        var caso = new Caso
        {
            ClienteNombre = request.ClienteNombre,
            Tipo = request.Tipo,
            Estatus = EstatusCaso.Activo,
            FechaApertura = DateTime.UtcNow,
            Notas = request.Notas
        };

        return await casoRepository.CreateAsync(caso);
    }
}
