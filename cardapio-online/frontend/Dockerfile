FROM node:18-alpine

WORKDIR /app

# Copia package.json primeiro (para cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código fonte
COPY . .

EXPOSE 3000

# Comando para desenvolvimento do Create React App
CMD ["npm", "start"]