using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.ResponderHorarioAlternativo;

public enum RespuestaSolicitante
{
    AceptarHorario,
    SolicitarOtroHorario
}

/// <summary>
/// El solicitante responde a un horario alternativo que propuso el despacho.
/// Se identifica por TokenPublico (enlace enviado por correo), nunca por Id.
/// </summary>
public record ResponderHorarioAlternativoCommand(
    string TokenPublico,
    RespuestaSolicitante Respuesta,
    DateTime? NuevaFechaHoraPropuesta) : IRequest;
