using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record PagoDto(
    int Id,
    int CasoId,
    string Concepto,
    decimal Monto,
    DateTime Fecha,
    TipoPago Tipo);
