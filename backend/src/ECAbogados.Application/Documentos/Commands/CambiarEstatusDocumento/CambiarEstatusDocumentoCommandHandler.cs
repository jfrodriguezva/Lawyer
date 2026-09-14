using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Documentos.Commands.CambiarEstatusDocumento;

public class CambiarEstatusDocumentoCommandHandler(
    IDocumentoRepository documentoRepository,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<CambiarEstatusDocumentoCommand>
{
    public async Task Handle(CambiarEstatusDocumentoCommand request, CancellationToken cancellationToken)
    {
        var documento = await documentoRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"No se encontró el documento con Id {request.Id}");

        await documentoRepository.ActualizarEstatusAsync(request.Id, request.Estatus, request.ComentarioRevision);

        await auditoriaRepository.RegistrarAsync(
            currentUser, "Caso", documento.CasoId,
            $"Cambió el estatus del documento '{documento.NombreArchivo}' a {request.Estatus}");
    }
}
