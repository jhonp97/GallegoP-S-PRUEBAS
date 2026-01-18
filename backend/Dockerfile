# Imagen base
FROM node:24-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependecias
RUN npm install --production

# Copiar el resto del codigo de la aplicacion
COPY . .

# Exponer el puerto en el que la aplicacion va a correr
EXPOSE 5000

# Comando para iniciar la aplicacion
CMD ["npm", "start"]

