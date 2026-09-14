using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.Configuracion.Commands.ActualizarFlag;

public record ActualizarFlagCommand(string Clave, bool Valor) : IRequest;
