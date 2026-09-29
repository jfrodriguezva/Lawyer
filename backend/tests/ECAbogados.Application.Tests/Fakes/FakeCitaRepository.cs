using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeCitaRepository : ICitaRepository
{
    private readonly List<Cita> _citas = [];
    private int _nextId = 1;

    public Task<IReadOnlyList<Cita>> GetAllAsync() => Task.FromResult<IReadOnlyList<Cita>>(_citas.ToList());

    public Task<Cita?> GetByIdAsync(int id) => Task.FromResult(_citas.FirstOrDefault(c => c.Id == id));

    public Task<int> CreateAsync(Cita cita)
    {
        cita.Id = _nextId++;
        _citas.Add(cita);
        return Task.FromResult(cita.Id);
    }

    public Task UpdateEstatusAsync(int id, EstatusCita estatus)
    {
        _citas.First(c => c.Id == id).Estatus = estatus;
        return Task.CompletedTask;
    }

    public Task MarkRecordatorioEnviadoAsync(int id)
    {
        _citas.First(c => c.Id == id).RecordatorioEnviado = true;
        return Task.CompletedTask;
    }

    public Task<bool> ExisteEnHorarioAsync(DateTime fechaHora) =>
        Task.FromResult(_citas.Any(c => c.FechaHora == fechaHora && c.Estatus == EstatusCita.Confirmada));

    public Task<IReadOnlyList<Cita>> GetProximasAsync(DateTime desde, int top) =>
        Task.FromResult<IReadOnlyList<Cita>>(_citas
            .Where(c => c.FechaHora >= desde && c.Estatus is EstatusCita.Pendiente or EstatusCita.Confirmada)
            .OrderBy(c => c.FechaHora)
            .Take(top)
            .ToList());

    public Task<(int Total, int Confirmadas)> GetConteoConfirmadasAsync() =>
        Task.FromResult((_citas.Count, _citas.Count(c => c.Estatus is EstatusCita.Confirmada or EstatusCita.Realizada or EstatusCita.NoAsistio)));
}
