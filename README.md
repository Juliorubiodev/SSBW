# Tienda Prado

Réplica de la tienda online del Museo del Prado desarrollada para la asignatura **Sistemas Software Basados en Web** (UGR).

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
| `entrega-1` | Tareas 1–6 |
| `entrega-2` | Tarea 7 (API RESTful) |
