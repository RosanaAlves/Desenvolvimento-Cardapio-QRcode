FROM php:8.2-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Instalar extensões PHP
RUN docker-php-ext-install pdo pdo_mysql mbstring

# Habilitar mod_rewrite do Apache
RUN a2enmod rewrite

# Criar diretório de trabalho
WORKDIR /var/www/html

# Copiar todos os arquivos do backend
COPY . .

# Configurar permissões (se necessário)
RUN chmod -R 755 .

# Expor porta 80 do Apache
EXPOSE 80

# Comando padrão do Apache
CMD ["apache2-foreground"]