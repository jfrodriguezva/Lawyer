using FluentValidation;

namespace ECAbogados.Application.Pagos.Commands.RegistrarPago;

public class RegistrarPagoCommandValidator : AbstractValidator<RegistrarPagoCommand>
{
    public RegistrarPagoCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.Concepto).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Monto).GreaterThan(0);
    }
}
