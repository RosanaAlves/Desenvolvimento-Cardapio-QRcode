FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]