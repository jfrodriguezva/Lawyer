using FluentValidation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.RevisarSolicitudCita;

public class RevisarSolicitudCitaCommandValidator : AbstractValidator<RevisarSolicitudCitaCommand>
{
    public RevisarSolicitudCitaCommandValidator()
    {
        RuleFor(x => x.SolicitudId).GreaterThan(0);
        RuleFor(x => x.Accion).IsInEnum();

        RuleFor(x => x.NuevaFechaHora)
            .NotNull().GreaterThan(DateTime.UtcNow)
            .When(x => x.Accion == AccionRevisionSolicitud.ProponerOtroHorario)
            .WithMessage("Debes proponer una fecha y hora futuras.");

        RuleFor(x => x.Motivo)
            .NotEmpty().MaximumLength(1000)
            .When(x => x.Accion is AccionRevisionSolicitud.Rechazar or AccionRevisionSolicitud.PedirInformacion)
            .WithMessage("Debes indicar un motivo.");
    }
}
