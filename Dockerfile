# Imagen base: Node 24 sobre Alpine (ligera).
# Node 24 ejecuta TypeScript de forma nativa, por eso podemos usar `node index.ts`.
FROM node:24-alpine AS base

# Directorio de trabajo dentro del contenedor
WORKDIR /build

# Copiamos primero los manifiestos para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instalamos dependencias.
# Nota: NO usamos --omit=dev porque necesitamos el CLI de Prisma (prisma)
# para generar el cliente y aplicar las migraciones en producción.
RUN npm ci && npm cache clean --force

# Copiamos el resto del código (lo que no esté en .dockerignore)
COPY . .

# Generamos el cliente de Prisma en /build/generated/prisma
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

# Puerto que expone la aplicación
EXPOSE 3000

# Arranque por defecto. En docker-compose-prod.yml se sobrescribe el command
# para aplicar migraciones y seed antes de levantar el servidor.
CMD ["node", "index.ts"]
