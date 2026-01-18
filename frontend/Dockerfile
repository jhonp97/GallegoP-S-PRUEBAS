# FASE 1:
# Build
FROM node:24-alpine AS build

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependecias
RUN npm install

# Copiar el resto del codigo de la aplicacion
COPY . .

# Ejecutar build de la aplicacion
RUN npm run build

# FASE 2:
FROM nginx:alpine

# Copiar el build de la fase 1 al directorio de ningx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto en el que la aplicacion va a correr
EXPOSE 80

# comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]