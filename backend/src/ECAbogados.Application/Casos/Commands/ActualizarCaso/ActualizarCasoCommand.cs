using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.ActualizarCaso;

public record ActualizarCasoCommand(
    int Id,
    string ClienteNombre,
    string Tipo,
    string? Notas,
    int? AbogadoResponsableId = null,
    string? Prioridad = null,
    string? FolioInterno = null,
    string? ContraparteNombre = null,
    string? AutoridadOrganismo = null,
    string? NumeroExpedienteExterno = null,
    decimal? MontoAcordado = null) : IRequest;
