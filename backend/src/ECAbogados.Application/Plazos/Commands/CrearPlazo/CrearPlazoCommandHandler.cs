using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Commands.CrearPlazo;

public class CrearPlazoCommandHandler(IPlazoRepository plazoRepository) : IRequestHandler<CrearPlazoCommand, int>
{
    public async Task<int> Handle(CrearPlazoCommand request, CancellationToken cancellationToken)
    {
        var plazo = new Plazo
        {
            CasoId = request.CasoId,
            Descripcion = request.Descripcion,
            FechaLimite = request.FechaLimite,
            Cumplido = false,
            AlertaEnviada = false
        };

        return await plazoRepository.CreateAsync(plazo);
    }
}
