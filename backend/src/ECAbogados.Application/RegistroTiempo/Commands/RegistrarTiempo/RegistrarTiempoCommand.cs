using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.RegistrosTiempo.Commands.RegistrarTiempo;

public record RegistrarTiempoCommand(int CasoId, int Minutos, string? Descripcion) : IRequest<int>;
