using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Commands.CambiarEstatusCliente;

public class CambiarEstatusClienteCommandHandler(IClienteRepository clienteRepository)
    : IRequestHandler<CambiarEstatusClienteCommand>
{
    public async Task Handle(CambiarEstatusClienteCommand request, CancellationToken cancellationToken)
    {
        await clienteRepository.SetActivoAsync(request.Id, request.Activo);
    }
}
