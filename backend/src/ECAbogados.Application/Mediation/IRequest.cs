namespace ECAbogados.Application.Mediation;

/// <summary>
/// Solicitud sin valor de retorno. Implementación propia y gratuita del patrón
/// mediator (reemplaza a MediatR, que exige licencia comercial en producción a
/// partir de cierta versión). Misma forma que MediatR.IRequest a propósito, para
/// que los Commands/Queries existentes no necesiten reescribirse.
/// </summary>
public interface IRequest
{
}

/// <summary>Solicitud que devuelve un valor de tipo <typeparamref name="TResponse"/>.</summary>
public interface IRequest<out TResponse>
{
}
