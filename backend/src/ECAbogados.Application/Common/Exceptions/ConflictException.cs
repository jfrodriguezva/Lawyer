namespace ECAbogados.Application.Common.Exceptions;

/// <summary>
/// Se lanza cuando una operación choca con el estado actual de los datos
/// (ej. un correo ya registrado). El middleware global la traduce a 409.
/// </summary>
public class ConflictException(string message) : Exception(message);
