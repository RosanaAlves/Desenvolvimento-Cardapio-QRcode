FROM php:8.2-fpm

WORKDIR /var/www/html

# Instala as dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libonig-dev \
    libzip-dev \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev

# Limpa o cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instala o Laravel
RUN composer create-project laravel/laravel . --prefer-dist

EXPOSE 80