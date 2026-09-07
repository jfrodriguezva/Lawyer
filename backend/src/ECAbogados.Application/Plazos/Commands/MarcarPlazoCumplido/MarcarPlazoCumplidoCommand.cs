using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Plazos.Commands.MarcarPlazoCumplido;

public record MarcarPlazoCumplidoCommand(int Id, bool Cumplido) : IRequest;
