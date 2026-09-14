using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Clientes.Commands.InvitarCliente;

/// <summary>
/// Da de alta un Cliente sin contraseña y le envía un enlace seguro de un solo
/// uso para que la establezca él mismo (alternativa a CrearClienteCommand,
/// donde el Abogado/Administrador captura la contraseña directamente).
/// </summary>
public record InvitarClienteCommand(string Email, string Nombre, int? ProspectoId = null) : IRequest<int>;
