# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 8080

# Comando para iniciar usando node directamente
CMD ["node", "dist/main.js"]
