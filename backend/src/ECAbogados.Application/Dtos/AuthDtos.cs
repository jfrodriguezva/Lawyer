namespace ECAbogados.Application.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string Nombre, string Email, string Rol);
