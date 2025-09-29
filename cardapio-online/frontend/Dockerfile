FROM php:8.2-apache

# Instalar extensões PHP
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite do Apache (essencial para Laravel)
RUN a2enmod rewrite
RUN a2enmod headers

# Configurar documento root para a pasta public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

# Substituir a configuração padrão do Apache
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos
COPY . .

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html/storage
RUN chown -R www-data:www-data /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage
RUN chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]