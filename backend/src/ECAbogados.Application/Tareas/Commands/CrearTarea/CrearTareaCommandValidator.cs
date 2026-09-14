using FluentValidation;

namespace ECAbogados.Application.Tareas.Commands.CrearTarea;

public class CrearTareaCommandValidator : AbstractValidator<CrearTareaCommand>
{
    public CrearTareaCommandValidator()
    {
        RuleFor(x => x.CasoId).GreaterThan(0);
        RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(300);
    }
}
