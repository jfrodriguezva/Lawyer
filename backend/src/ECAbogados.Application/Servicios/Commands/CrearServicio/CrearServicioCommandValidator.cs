using FluentValidation;

namespace ECAbogados.Application.Servicios.Commands.CrearServicio;

public class CrearServicioCommandValidator : AbstractValidator<CrearServicioCommand>
{
    public CrearServicioCommandValidator()
    {
        RuleFor(x => x.ModuloId).GreaterThan(0);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(150).Matches("^[a-z0-9]+(-[a-z0-9]+)*$")
            .WithMessage("El slug debe ser minúsculas, números y guiones (ej. divorcio-incausado).");
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Frase).MaximumLength(300);
        RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Tipo).MaximumLength(150);
        RuleFor(x => x.Beneficios).NotEmpty().WithMessage("Agrega al menos un beneficio.");
        RuleFor(x => x.Proceso).NotEmpty().WithMessage("Agrega al menos un paso del proceso.");
    }
}
