using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Pagos.Commands.RegistrarPago;

public record RegistrarPagoCommand(int CasoId, string Concepto, decimal Monto) : IRequest<int>;
