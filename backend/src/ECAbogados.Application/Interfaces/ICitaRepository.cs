using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Interfaces;

public interface ICitaRepository
{
    Task<IReadOnlyList<Cita>> GetAllAsync();
    Task<Cita?> GetByIdAsync(int id);
    Task<int> CreateAsync(Cita cita);
    Task UpdateEstatusAsync(int id, EstatusCita estatus);
    Task MarkRecordatorioEnviadoAsync(int id);

    // Usado al confirmar una SolicitudCita: evita crear dos citas confirmadas
    // en el mismo horario (prevención de horarios duplicados).
    Task<bool> ExisteEnHorarioAsync(DateTime fechaHora);

    // Para el dashboard: las `top` siguientes citas no canceladas a partir de `desde` (UTC).
    Task<IReadOnlyList<Cita>> GetProximasAsync(DateTime desde, int top);

    Task<(int Total, int Confirmadas)> GetConteoConfirmadasAsync();
}
