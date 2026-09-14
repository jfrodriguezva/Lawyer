namespace ECAbogados.Domain.Entities;

public enum TipoPago
{
    Anticipo,
    Pago,
    Ajuste
}

public class Pago
{
    public int Id { get; set; }
    public int CasoId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public TipoPago Tipo { get; set; } = TipoPago.Pago;
}
