# Tienda Prado

Réplica de la tienda online del Museo del Prado desarrollada para la asignatura **Sistemas Software Basados en Web** (UGR).

## 🌐 Aplicación desplegada

La tienda está desplegada y accesible públicamente en:

### 👉 http://165.227.159.247

> Desplegada en un **VPS (Ubuntu 24.04)** mediante **Docker Compose**, con **Caddy** como proxy inverso en el puerto 80. Ver la sección [Despliegue en producción](#despliegue-en-producción-tarea-13) para más detalles.

## Tecnologías

- **Node.js v24** con TypeScript (soporte nativo, sin compilación)
- **Express 5** — servidor web MPA
- **Nunjucks** — motor de plantillas con herencia
- **Prisma 7** + **PostgreSQL** (via Docker) — ORM y base de datos
- **Winston** — logging con transporte a consola y ficheros
- **express-session** — carrito de compra persistido en sesión
- **JWT** en cookie httpOnly — autenticación de usuarios
- **Bootstrap 5** — interfaz de usuario

## Estructura del proyecto (MVC)

```
├── routes/          # Controladores (Express Router)
│   ├── productos.ts # Portada, búsqueda, detalle, carrito, checkout
│   ├── usuarios.ts  # Login, registro, perfil, admin
│   └── api.ts       # API RESTful de productos
├── views/           # Vistas (Nunjucks)
│   ├── base.njk     # Plantilla base con navbar y footer
│   └── *.njk        # Portada, detalle, carrito, checkout, perfil, admin...
├── prisma/          # Modelo
│   ├── schema.prisma
│   └── prisma.client.ts  # Cliente con extensiones registra/autentifica
├── imagenes/        # Imágenes de productos (incluidas en el repo)
├── index.ts         # Punto de entrada, middlewares
├── logger.ts        # Configuración Winston
├── seed.ts          # Poblar BD desde productos.json
└── registra_usuarios.ts  # Crear usuarios de prueba
```

## Puesta en marcha

### 1. Requisitos previos

- Node.js v23+
- Docker Desktop

### 2. Instalación

```bash
npm install
```

### 3. Variables de entorno

Copiar el archivo de ejemplo y ajustar si es necesario:

```bash
cp .env.example .env
```

### 4. Base de datos

```bash
# Levantar PostgreSQL en Docker
docker-compose up -d

# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Poblar productos
npx tsx seed.ts

# Crear usuarios de prueba
npx tsx registra_usuarios.ts
```

### 5. Arrancar el servidor

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Despliegue en producción (Tarea 13)

La aplicación se despliega como **IaaS** en un único VPS mediante `docker compose`, sin servicios gestionados externos. Esto da control total sobre el despliegue y permite usar cualquier proveedor de VPS o CaaS.

- **Dónde:** VPS Ubuntu 24.04 (DigitalOcean)
- **URL pública:** http://165.227.159.247
- **Orquestación:** `docker-compose-prod.yml` con tres servicios:
  - **`db`** — PostgreSQL 16 (con healthcheck y volumen persistente)
  - **`tienda-prado`** — la aplicación Express, construida con el `Dockerfile`
  - **`caddy`** — proxy inverso/servidor web (HTTPS, caché, compresión) expuesto en el puerto 80

El servicio de la aplicación aplica las migraciones de Prisma y carga los productos automáticamente al arrancar.

```bash
# En el VPS (con Docker ya instalado y el repositorio clonado)
cp .env.prod.example .env          # configurar variables de entorno
docker compose -f docker-compose-prod.yml up --build -d
```

> Con un nombre de dominio en lugar de la IP, Caddy gestiona automáticamente los certificados SSL (Let's Encrypt), el puerto 443 y la redirección HTTP → HTTPS.

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@tiendaprado.com | admin123 | Administrador |
| juan@correo.com | juan123 | Usuario |
| maria@correo.com | maria123 | Usuario |

## Ramas

| Rama | Contenido |
|------|-----------|
| `main` | Código actualizado |
| `entrega-1` | Tareas 1–7 (setup, scraping, BD, MVC, carrito, auth, API REST) |
| `entrega-2` | Tareas 8–9 (mejoras UX, carrito offcanvas, SPA React) |
| `entrega-3` | Tareas 10–13 (React Router, Astro SSG, despliegue en VPS) |
