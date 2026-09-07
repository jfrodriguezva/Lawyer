using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Pagos.Commands.RegistrarPago;

public class RegistrarPagoCommandHandler(IPagoRepository pagoRepository) : IRequestHandler<RegistrarPagoCommand, int>
{
    public async Task<int> Handle(RegistrarPagoCommand request, CancellationToken cancellationToken)
    {
        var pago = new Pago
        {
            CasoId = request.CasoId,
            Concepto = request.Concepto,
            Monto = request.Monto,
            Fecha = DateTime.UtcNow
        };

        return await pagoRepository.CreateAsync(pago);
    }
}
