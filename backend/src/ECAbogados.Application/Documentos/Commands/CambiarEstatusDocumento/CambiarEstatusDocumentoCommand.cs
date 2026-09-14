using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Documentos.Commands.CambiarEstatusDocumento;

public record CambiarEstatusDocumentoCommand(int Id, EstatusDocumento Estatus, string? ComentarioRevision) : IRequest;
