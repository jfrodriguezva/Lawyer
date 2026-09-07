using MediatR;

namespace ECAbogados.Application.Casos.Commands.CrearCaso;

public record CrearCasoCommand(
    string ClienteNombre,
    string Tipo,
    string? Notas) : IRequest<int>;
