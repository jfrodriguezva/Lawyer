using ECAbogados.Application.Auth.Shared;
using ECAbogados.Application.Casos;
using ECAbogados.Application.Common.Exceptions;
using ECAbogados.Application.Interfaces;
using ECAbogados.Application.Mediation;
using ECAbogados.Domain.Entities;

namespace ECAbogados.Application.Prospectos.Commands.ConvertirProspecto;

public class ConvertirProspectoCommandHandler(
    IProspectoRepository prospectoRepository,
    IClienteRepository clienteRepository,
    ICasoRepository casoRepository,
    IChecklistItemRepository checklistItemRepository,
    IPasswordHasher passwordHasher,
    IInvitacionClienteNotifier invitacionNotifier,
    IAuditoriaRepository auditoriaRepository,
    ICurrentUserAccessor currentUser) : IRequestHandler<ConvertirProspectoCommand, ConvertirProspectoResult>
{
    private static readonly TimeSpan VigenciaInvitacion = TimeSpan.FromHours(72);

    public async Task<ConvertirProspectoResult> Handle(ConvertirProspectoCommand request, CancellationToken cancellationToken)
    {
        var prospecto = await prospectoRepository.GetByIdAsync(request.ProspectoId)
            ?? throw new KeyNotFoundException($"No se encontró el prospecto con Id {request.ProspectoId}");

        if (prospecto.ClienteId is not null)
        {
            throw new ConflictException("Este prospecto ya fue convertido en cliente.");
        }

        var clienteExistente = await clienteRepository.GetByEmailAsync(prospecto.Email);
        if (clienteExistente is not null)
        {
            throw new ConflictException("Ya existe un cliente con ese correo.");
        }

        var cliente = new Cliente
        {
            Email = prospecto.Email,
            Nombre = prospecto.Nombre,
            Telefono = prospecto.Telefono,
            FechaCreacion = DateTime.UtcNow
        };

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            // Invitación segura: el cliente establece su propia contraseña.
            cliente.PasswordHash = passwordHasher.Hash(Guid.NewGuid().ToString());
            cliente.InvitacionPendiente = true;
        }
        else
        {
            cliente.PasswordHash = passwordHasher.Hash(request.Password);
        }

        var clienteId = await clienteRepository.CreateAsync(cliente);

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            var token = await PasswordResetService.GenerarTokenAsync(clienteRepository, clienteId, VigenciaInvitacion);
            await invitacionNotifier.EnviarInvitacionAsync(prospecto.Email, prospecto.Nombre, token, cancellationToken);
        }

        var caso = new Caso
        {
            ClienteNombre = prospecto.Nombre,
            ClienteId = clienteId,
            Tipo = request.TipoCaso,
            Estatus = EstatusCaso.Activo,
            FechaApertura = DateTime.UtcNow,
            Notas = request.NotasCaso,
            AbogadoResponsableId = request.AbogadoResponsableId,
            Prioridad = request.Prioridad,
            TokenAcceso = Guid.NewGuid().ToString("N"),
            TokenGeneradoEn = DateTime.UtcNow
        };

        var casoId = await casoRepository.CreateAsync(caso);

        var requisitos = RequisitosPorTipo.Obtener(request.TipoCaso);
        if (requisitos.Length > 0)
        {
            await checklistItemRepository.CreateManyAsync(casoId, requisitos);
        }

        prospecto.ClienteId = clienteId;
        prospecto.Etapa = EtapaProspecto.Contratado;
        await prospectoRepository.UpdateAsync(prospecto);

        await auditoriaRepository.RegistrarAsync(currentUser, "Prospecto", prospecto.Id, "Convirtió al prospecto en cliente", $"Cliente #{clienteId}, Caso #{casoId}");
        await auditoriaRepository.RegistrarAsync(currentUser, "Caso", casoId, "Creó el expediente a partir de un prospecto convertido");

        return new ConvertirProspectoResult(clienteId, casoId);
    }
}
