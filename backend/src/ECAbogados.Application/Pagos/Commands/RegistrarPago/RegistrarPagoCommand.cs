using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Pagos.Commands.RegistrarPago;

public record RegistrarPagoCommand(int CasoId, string Concepto, decimal Monto, TipoPago Tipo = TipoPago.Pago) : IRequest<int>;
