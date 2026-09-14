using FluentValidation;

namespace ECAbogados.Application.Configuracion.Commands.ActualizarFlag;

public class ActualizarFlagCommandValidator : AbstractValidator<ActualizarFlagCommand>
{
    private static readonly string[] ClavesValidas = ["sat_habilitado", "comercializadora_habilitada"];

    public ActualizarFlagCommandValidator()
    {
        RuleFor(x => x.Clave).Must(c => ClavesValidas.Contains(c))
            .WithMessage($"Clave debe ser una de: {string.Join(", ", ClavesValidas)}.");
    }
}
