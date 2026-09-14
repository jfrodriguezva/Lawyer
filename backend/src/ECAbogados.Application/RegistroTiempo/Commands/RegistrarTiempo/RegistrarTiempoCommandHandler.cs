using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;

namespace ECAbogados.Application.RegistrosTiempo.Commands.RegistrarTiempo;

public class RegistrarTiempoCommandHandler(
    IRegistroTiempoRepository registroTiempoRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<RegistrarTiempoCommand, int>
{
    public Task<int> Handle(RegistrarTiempoCommand request, CancellationToken cancellationToken) =>
        registroTiempoRepository.CreateAsync(new Domain.Entities.RegistroTiempo
        {
            CasoId = request.CasoId,
            UsuarioId = currentUser.UsuarioId ?? 0,
            UsuarioNombre = currentUser.Nombre,
            Minutos = request.Minutos,
            Descripcion = request.Descripcion,
            Fecha = DateTime.UtcNow
        });
}
