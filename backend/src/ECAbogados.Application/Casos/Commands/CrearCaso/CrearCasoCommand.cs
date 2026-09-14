using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.CrearCaso;

public record CrearCasoCommand(
    string ClienteNombre,
    string Tipo,
    string? Notas,
    int? AbogadoResponsableId = null,
    string? Prioridad = null,
    string? FolioInterno = null,
    string? ContraparteNombre = null,
    string? AutoridadOrganismo = null,
    string? NumeroExpedienteExterno = null) : IRequest<int>;
