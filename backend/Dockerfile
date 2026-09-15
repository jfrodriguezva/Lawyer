# Build context: backend/ (necesario porque ECAbogados.Api.csproj referencia a
# ..\ECAbogados.Application y ..\ECAbogados.Infrastructure con rutas relativas).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/ECAbogados.Domain/ECAbogados.Domain.csproj src/ECAbogados.Domain/
COPY src/ECAbogados.Application/ECAbogados.Application.csproj src/ECAbogados.Application/
COPY src/ECAbogados.Infrastructure/ECAbogados.Infrastructure.csproj src/ECAbogados.Infrastructure/
COPY src/ECAbogados.Api/ECAbogados.Api.csproj src/ECAbogados.Api/
RUN dotnet restore src/ECAbogados.Api/ECAbogados.Api.csproj

COPY src/ src/
RUN dotnet publish src/ECAbogados.Api/ECAbogados.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Los documentos subidos (App_Data/documentos) viven en un volumen aparte,
# montado por docker-compose, para que sobrevivan a reconstrucciones de la imagen.
RUN mkdir -p /app/App_Data/documentos

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5080
EXPOSE 5080

ENTRYPOINT ["dotnet", "ECAbogados.Api.dll"]
