# Despliegue en un VPS (Ubuntu + Docker)

Guía paso a paso para poner el sistema en un VPS nuevo (pensada para el VPS-2 de
OVHcloud con Ubuntu 22.04/24.04, pero sirve para cualquier VPS Linux).

## 0. Antes de empezar

- El VPS ya contratado, con una IP pública fija.
- Acceso por SSH al VPS.
- El dominio `ecgabogados.com` administrado en Cloudflare (ya es el caso).

## 1. Preparar el VPS

Conéctate por SSH y instala Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# cierra sesión y vuelve a entrar para que el grupo "docker" tome efecto
```

Firewall — solo dejar abierto lo necesario:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. Traer el código

```bash
git clone https://github.com/jfrodriguezva/Lawyer.git
cd Lawyer
cp .env.example .env
nano .env   # rellena cada valor (ver comentarios dentro del archivo)
```

## 3. DNS en Cloudflare

En el panel de Cloudflare, pestaña DNS, agrega (o edita si ya existen):

| Tipo | Nombre | Contenido           | Proxy |
|------|--------|---------------------|-------|
| A    | @      | *(IP pública del VPS)* | DNS only (nube gris) |
| A    | www    | *(IP pública del VPS)* | DNS only (nube gris) |

Importante: déjalos en **"DNS only"** (nube gris, no naranja) al menos hasta
terminar el paso 4 — con el proxy de Cloudflare activado, la verificación de
Let's Encrypt se complica innecesariamente la primera vez. Una vez que todo
funcione con HTTPS, puedes activar el proxy naranja si quieres el CDN/protección
de Cloudflare.

Esto es aparte de Email Routing — un registro **A** (para la página) y los
registros **MX** (para el correo) conviven sin problema en el mismo DNS.

## 4. Certificado HTTPS (primera vez)

Es un problema de huevo y gallina: nginx no arranca con la configuración final
porque pide un certificado que todavía no existe. Se resuelve en dos pasos.

**4.1 — Arranca nginx solo con el bloque HTTP** (edita `deploy/nginx.conf` y
comenta temporalmente todo el segundo bloque `server { listen 443 ... }`,
dejando solo el primero):

```bash
docker compose up -d nginx
```

**4.2 — Pide el certificado:**

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d ecgabogados.com -d www.ecgabogados.com \
  --email TU_CORREO_REAL --agree-tos --no-eff-email
```

**4.3 — Descomenta el bloque 443** en `deploy/nginx.conf` (déjalo como está en
el repo) y recarga:

```bash
docker compose restart nginx
```

## 5. Base de datos (primera vez)

```bash
docker compose up -d sqlserver
# espera ~20 segundos a que arranque
docker compose cp backend/database/schema.sql sqlserver:/tmp/schema.sql
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$(grep SQL_SA_PASSWORD .env | cut -d= -f2)" \
  -C -f 65001 -i /tmp/schema.sql
```

Si `sqlcmd` no se encuentra en esa ruta, prueba `/opt/mssql-tools/bin/sqlcmd`
(la ruta cambió de nombre entre versiones de la imagen).

## 6. Levantar todo

```bash
docker compose up -d --build
```

Esto construye la API (.NET) y el frontend (Next.js) y los deja corriendo.
Verifica en `https://ecgabogados.com`.

## 7. Renovación del certificado

El contenedor `certbot` ya se queda corriendo y renueva automáticamente cada 12
horas si hace falta — pero nginx no recarga solo el certificado nuevo. Agrega
un cron semanal en el VPS:

```bash
crontab -e
# agrega esta línea:
0 4 * * 0 cd /ruta/a/Lawyer && docker compose restart nginx
```

## 8. Actualizar el sistema después de un cambio

```bash
cd Lawyer
git pull
docker compose up -d --build
```

## Notas

- El Gateway (Ocelot) no se despliega — el frontend habla directo con la API
  a través de nginx (`/api/*`), y hoy el Gateway solo enruta la mitad de los
  endpoints reales.
- Los documentos subidos viven en el volumen Docker `documentos`, no en la
  imagen — sobreviven a un `docker compose up --build`. Aun así, agrega el
  respaldo diario que ya trae el VPS de OVHcloud a tu rutina de verificación.
