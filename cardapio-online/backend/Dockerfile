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
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia os arquivos do projeto (incluindo composer.json)
COPY . .

# Instala dependências do Laravel (se composer.json existir)
RUN if [ -f "composer.json" ]; then composer install --no-dev --optimize-autoloader; fi

# Configura permissões do Laravel
RUN chown -R www-data:www-data /var/www/html/storage
RUN chown -R www-data:www-data /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage
RUN chmod -R 775 /var/www/html/bootstrap/cache

# Cria o arquivo .env se não existir
RUN if [ ! -f ".env" ]; then cp .env.example .env; fi

# Gera key do Laravel
RUN php artisan key:generate --no-interaction

EXPOSE 9000

CMD ["php-fpm"]