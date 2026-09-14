using ECAbogados.Application.Interfaces;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Tests.Fakes;

public class FakeProspectoRepository : IProspectoRepository
{
    private readonly List<Prospecto> _prospectos = [];
    private int _nextId = 1;

    public void Seed(Prospecto prospecto)
    {
        prospecto.Id = _nextId++;
        _prospectos.Add(prospecto);
    }

    public Task<Prospecto?> GetByEmailAsync(string email) =>
        Task.FromResult(_prospectos.FirstOrDefault(p => p.Email == email));

    public Task<Prospecto?> GetByIdAsync(int id) =>
        Task.FromResult(_prospectos.FirstOrDefault(p => p.Id == id));

    public Task<IReadOnlyList<Prospecto>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Prospecto>>(_prospectos.ToList());

    public Task<int> CreateAsync(Prospecto prospecto)
    {
        prospecto.Id = _nextId++;
        _prospectos.Add(prospecto);
        return Task.FromResult(prospecto.Id);
    }

    public Task UpdateAsync(Prospecto prospecto)
    {
        var existente = _prospectos.First(p => p.Id == prospecto.Id);
        existente.Nombre = prospecto.Nombre;
        existente.Telefono = prospecto.Telefono;
        existente.MedioContactoPreferido = prospecto.MedioContactoPreferido;
        existente.ConflictoInteres = prospecto.ConflictoInteres;
        existente.ResponsableUsuarioId = prospecto.ResponsableUsuarioId;
        existente.ResultadoEntrevista = prospecto.ResultadoEntrevista;
        existente.Etapa = prospecto.Etapa;
        existente.MotivoNoContratacion = prospecto.MotivoNoContratacion;
        existente.ClienteId = prospecto.ClienteId;
        return Task.CompletedTask;
    }

    public Task VincularClienteAsync(int prospectoId, int clienteId)
    {
        _prospectos.First(p => p.Id == prospectoId).ClienteId = clienteId;
        return Task.CompletedTask;
    }
}
