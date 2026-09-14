using FluentValidation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.CrearSolicitudCita;

public class CrearSolicitudCitaCommandValidator : AbstractValidator<CrearSolicitudCitaCommand>
{
    public CrearSolicitudCitaCommandValidator()
    {
        RuleFor(x => x.NombreSolicitante).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EmailSolicitante).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.TelefonoSolicitante).NotEmpty().MaximumLength(30);
        RuleFor(x => x.MedioContactoPreferido).MaximumLength(50);
        RuleFor(x => x.Modulo).IsInEnum();
        RuleFor(x => x.ServicioInteres).MaximumLength(150);
        RuleFor(x => x.Descripcion).MaximumLength(2000);
        RuleFor(x => x.Modalidad).IsInEnum();
        RuleFor(x => x.FechaHoraPropuesta).GreaterThan(DateTime.UtcNow)
            .WithMessage("La fecha y hora propuestas deben ser futuras.");
        RuleFor(x => x.AceptoAvisoPrivacidad).Equal(true)
            .WithMessage("Debes aceptar el aviso de privacidad para continuar.");
    }
}
