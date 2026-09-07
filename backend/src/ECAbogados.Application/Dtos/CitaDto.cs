using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Dtos;

public record CitaDto(
    int Id,
    int? CasoId,
    string NombreCliente,
    string Telefono,
    DateTime FechaHora,
    EstatusCita Estatus);
