using FluentValidation;

namespace ECAbogados.Application.Citas.Commands.CrearCita;

public class CrearCitaCommandValidator : AbstractValidator<CrearCitaCommand>
{
    public CrearCitaCommandValidator()
    {
        RuleFor(x => x.NombreCliente).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Telefono).NotEmpty().MaximumLength(30);
        RuleFor(x => x.FechaHora).NotEmpty();
    }
}
