using ECAbogados.Application.Dtos;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Queries.ListarClientes;

public class ListarClientesQueryHandler(IClienteRepository clienteRepository)
    : IRequestHandler<ListarClientesQuery, IReadOnlyList<ClienteDto>>
{
    public async Task<IReadOnlyList<ClienteDto>> Handle(ListarClientesQuery request, CancellationToken cancellationToken)
    {
        var clientes = await clienteRepository.GetAllAsync();

        return clientes
            .Select(c => new ClienteDto(c.Id, c.Email, c.Nombre, c.Activo))
            .ToList();
    }
}
