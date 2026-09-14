using FluentValidation;

namespace ECAbogados.Application.Citas.SolicitudesCita.Commands.ResponderHorarioAlternativo;

public class ResponderHorarioAlternativoCommandValidator : AbstractValidator<ResponderHorarioAlternativoCommand>
{
    public ResponderHorarioAlternativoCommandValidator()
    {
        RuleFor(x => x.TokenPublico).NotEmpty();
        RuleFor(x => x.Respuesta).IsInEnum();
        RuleFor(x => x.NuevaFechaHoraPropuesta)
            .NotNull().GreaterThan(DateTime.UtcNow)
            .When(x => x.Respuesta == RespuestaSolicitante.SolicitarOtroHorario)
            .WithMessage("Debes proponer una fecha y hora futuras.");
    }
}
