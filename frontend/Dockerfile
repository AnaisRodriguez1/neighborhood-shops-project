FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto para desarrollo
EXPOSE 5173

# Comando para iniciar en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host"]
