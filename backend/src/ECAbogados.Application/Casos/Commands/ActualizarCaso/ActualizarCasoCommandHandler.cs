using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Casos.Commands.ActualizarCaso;

public class ActualizarCasoCommandHandler(
    ICasoRepository casoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<ActualizarCasoCommand>
{
    public async Task Handle(ActualizarCasoCommand request, CancellationToken cancellationToken)
    {
        var caso = await casoRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el caso con Id {request.Id}");

        caso.ClienteNombre = request.ClienteNombre;
        caso.Tipo = request.Tipo;
        caso.Notas = request.Notas;
        caso.AbogadoResponsableId = request.AbogadoResponsableId;
        caso.Prioridad = request.Prioridad;
        caso.FolioInterno = request.FolioInterno;
        caso.ContraparteNombre = request.ContraparteNombre;
        caso.AutoridadOrganismo = request.AutoridadOrganismo;
        caso.NumeroExpedienteExterno = request.NumeroExpedienteExterno;
        caso.MontoAcordado = request.MontoAcordado;

        await casoRepository.UpdateAsync(caso);

        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", caso.Id, "Actualizó los datos del caso");
    }
}
