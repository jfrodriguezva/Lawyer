# Despliegue en el VPS (Ubuntu + Docker)

Este repo despliega **solo la app** (api + frontend). SQL Server y el proxy HTTPS son
infraestructura compartida del VPS y viven en `~/infra` (carpeta creada a mano en el
servidor, no es un repo):

```
/home/ubuntu/
├── infra/     infra-sqlserver (SQL Server 2022) + infra-caddy (80/443, HTTPS automático)
│              .env (sa, correo de Let's Encrypt), caddy/sites/*.caddy, scripts/, backups/
├── Lawyer/    este repo: lawyer-api + lawyer-frontend, con su .env
└── Mrkos/     otra app, independiente
```

| Pieza | Dónde vive |
|---|---|
| API, frontend y volúmenes `lawyer_documentos` / `lawyer_promociones` / `lawyer_logs` | `~/Lawyer` |
| BD `ECAbogados` y su login `kika` (solo esa BD) | `infra-sqlserver`, red `data` |
| Sitio `ecgabogados.com` (proxy, headers de seguridad, límite de 55 MB, `www` → raíz) | `~/infra/caddy/sites/ecgabogados.caddy` |
| Certificados HTTPS | Caddy los saca y renueva solo (ya no hay certbot ni cron de nginx) |
| Respaldo diario de las BD y de los documentos | `~/infra/scripts/backup.sh`, cron 3:30 a. m. CDMX → `~/infra/backups/` (14 días) |

Las dos redes (`edge` para el proxy, `data` para la BD) las crea `~/infra`, así que
`~/infra` tiene que estar levantado antes que este compose.

## Actualizar después de un cambio

```bash
cd ~/Lawyer
git pull origin main
docker compose up -d --build
```

**Si el cambio toca `backend/database/schema.sql`**, aplícalo antes (es idempotente, no
borra ni duplica datos). Se corre como `sa`, cuya contraseña está en `~/infra/.env`:

```bash
docker cp ~/Lawyer/backend/database/schema.sql infra-sqlserver:/tmp/schema.sql
docker exec -it -e SQLCMDPASSWORD="$(grep '^SQL_SA_PASSWORD=' ~/infra/.env | cut -d= -f2-)" \
  infra-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -d ECAbogados -f 65001 -i /tmp/schema.sql
```

**Datos de ejemplo de instalaciones anteriores:** hasta septiembre de 2026,
`schema.sql` insertaba 2 casos "[DATOS DE PRUEBA]" con sus citas. Los que existan
se borran con `deploy/limpiar-datos-prueba.sql` (instrucciones dentro: respaldo,
vista previa con ROLLBACK, luego COMMIT).

## Conectarse a la BD desde SSMS (túnel SSH)

El SQL Server no está expuesto a internet; solo escucha dentro del VPS
(`127.0.0.1:1434`). Para entrar desde tu PC:

1. En PowerShell, deja abierto el túnel mientras trabajas:
   ```powershell
   ssh -N -L 14330:localhost:1434 ubuntu@51.81.202.18
   ```
2. En SSMS: servidor `localhost,14330`, SQL Server Authentication, usuario `sa` (todo) o
   `kika` (solo `ECAbogados`), y marca **Trust server certificate**.
3. `Ctrl+C` en PowerShell cierra el túnel.

## VPS nuevo desde cero

1. Docker (`curl -fsSL https://get.docker.com | sh`) y firewall con 22, 80 y 443.
2. Levanta `~/infra` (SQL Server + Caddy) con su `.env`.
3. Crea la BD y el login de la app en `infra-sqlserver` (`CREATE DATABASE ECAbogados`,
   `CREATE LOGIN kika ...`, usuario `db_owner` solo en esa BD) y aplica `schema.sql`.
4. `git clone https://github.com/jfrodriguezva/Lawyer.git ~/Lawyer`,
   `cp .env.example .env`, llena `DB_PASSWORD`, `JWT_SECRET` y SMTP, y
   `docker compose up -d --build`.
5. Agrega `~/infra/caddy/sites/ecgabogados.caddy` y recarga Caddy.
6. DNS en Cloudflare: registros A `@` y `www` → IP del VPS, en **DNS only** (nube gris).

**Datos de ejemplo de instalaciones anteriores:** hasta septiembre de 2026,
`schema.sql` insertaba 2 casos "[DATOS DE PRUEBA]" con sus citas. Ya no lo
hace, pero los que existan en la BD se borran con
`deploy/limpiar-datos-prueba.sql` (instrucciones dentro del archivo: primero
respaldo, luego vista previa con ROLLBACK, luego COMMIT).

## Notas

- No hay Gateway: el frontend habla directo con la API por `/api/*` bajo el mismo dominio.
- La API confía en `X-Forwarded-For` solo si viene de redes privadas (la red de Docker
  donde está Caddy), así que el rate limit usa la IP real del visitante.
- Los documentos subidos viven en el volumen `lawyer_documentos`, no en la imagen:
  sobreviven a `docker compose up --build` y entran en el respaldo diario.
