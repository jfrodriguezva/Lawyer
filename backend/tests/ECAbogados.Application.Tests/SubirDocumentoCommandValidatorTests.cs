using ECAbogados.Application.Documentos;
using ECAbogados.Application.Documentos.Commands.SubirDocumento;

namespace ECAbogados.Application.Tests;

public class SubirDocumentoCommandValidatorTests
{
    private static readonly SubirDocumentoCommandValidator Validator = new();

    [Fact]
    public void Rechaza_extension_no_permitida()
    {
        var comando = new SubirDocumentoCommand(1, "virus.exe", "application/octet-stream", 1024, "App_Data/documentos/1/virus.exe");

        var resultado = Validator.Validate(comando);

        Assert.False(resultado.IsValid);
        Assert.Contains(resultado.Errors, e => e.PropertyName == nameof(SubirDocumentoCommand.NombreArchivo));
    }

    [Fact]
    public void Rechaza_archivo_mayor_al_tamano_maximo()
    {
        var comando = new SubirDocumentoCommand(1, "contrato.pdf", "application/pdf", TiposPermitidos.TamanoMaximoBytes + 1, "App_Data/documentos/1/contrato.pdf");

        var resultado = Validator.Validate(comando);

        Assert.False(resultado.IsValid);
        Assert.Contains(resultado.Errors, e => e.PropertyName == nameof(SubirDocumentoCommand.TamanoBytes));
    }

    [Fact]
    public void Acepta_archivo_con_extension_permitida_y_tamano_valido()
    {
        var comando = new SubirDocumentoCommand(1, "contrato.pdf", "application/pdf", 1024, "App_Data/documentos/1/contrato.pdf");

        var resultado = Validator.Validate(comando);

        Assert.True(resultado.IsValid);
    }
}
