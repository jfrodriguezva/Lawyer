using ECAbogados.Application.Dtos;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Queries.ListarClientes;

public record ListarClientesQuery : IRequest<IReadOnlyList<ClienteDto>>;
