using ECAbogados.Application.Mediation;
using ECAbogados.Application.Prospectos.Commands.ConvertirProspecto;
using ECAbogados.Application.Prospectos.Commands.RegistrarResultadoEntrevista;
using ECAbogados.Application.Prospectos.Queries.ListarProspectos;
using ECAbogados.Application.Prospectos.Queries.ObtenerProspectoPorId;
using ECAbogados.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECAbogados.Api.Controllers;

[Authorize(Roles = "Abogado,Administrador")]
[ApiController]
[Route("api/[controller]")]
public class ProspectosController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var prospectos = await sender.Send(new ListarProspectosQuery());
        return Ok(prospectos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var prospecto = await sender.Send(new ObtenerProspectoPorIdQuery(id));
        return prospecto is null ? NotFound() : Ok(prospecto);
    }

    [HttpPost("{id:int}/entrevista")]
    public async Task<IActionResult> RegistrarResultadoEntrevista(int id, [FromBody] RegistrarResultadoEntrevistaRequest request)
    {
        await sender.Send(new RegistrarResultadoEntrevistaCommand(id, request.ResultadoEntrevista, request.ConflictoInteres, request.MotivoNoContratacion));
        return NoContent();
    }

    [HttpPost("{id:int}/convertir")]
    public async Task<IActionResult> Convertir(int id, [FromBody] ConvertirProspectoRequest request)
    {
        var resultado = await sender.Send(new ConvertirProspectoCommand(
            id, request.TipoCaso, request.NotasCaso, request.AbogadoResponsableId, request.Prioridad, request.Password));
        return Ok(resultado);
    }
}

public record RegistrarResultadoEntrevistaRequest(
    string ResultadoEntrevista,
    EstatusConflictoInteres ConflictoInteres,
    string? MotivoNoContratacion);

public record ConvertirProspectoRequest(
    string TipoCaso,
    string? NotasCaso,
    int? AbogadoResponsableId,
    string? Prioridad,
    string? Password);
