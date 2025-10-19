FROM php:8.2-fpm

WORKDIR /var/www/html

# Instala dependências do sistema + Node.js e NPM
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libonig-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    nodejs \
    npm

# Instala extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Limpa o cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY composer.json composer.lock ./
# Instala as dependências do PHP
RUN composer install --no-scripts --no-autoloader

# Copia o restante dos arquivos da aplicação
COPY . .

# Gera o autoloader do Composer
RUN composer dump-autoload --optimize

# Copia os arquivos de dependência do Node.js
COPY package.json  ./
# Instala as dependências do Node.js
RUN npm install

# Expõe a porta correta para o PHP-FPM
EXPOSE 9000