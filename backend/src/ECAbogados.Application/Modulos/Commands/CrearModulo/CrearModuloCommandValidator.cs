using ECAbogados.Domain.Entities;
using FluentValidation;

namespace ECAbogados.Application.Modulos.Commands.CrearModulo;

public class CrearModuloCommandValidator : AbstractValidator<CrearModuloCommand>
{
    public CrearModuloCommandValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(100).Matches("^[a-z0-9]+(-[a-z0-9]+)*$")
            .WithMessage("El slug debe ser minúsculas, números y guiones (ej. derecho-penal).");
        RuleFor(x => x.RolResponsable).Must(r => RolesResponsablesModulo.Validos.Contains(r))
            .WithMessage($"RolResponsable debe ser uno de: {string.Join(", ", RolesResponsablesModulo.Validos)}.");
    }
}
