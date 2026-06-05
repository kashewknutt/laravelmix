# Stage 1: Build theme assets
FROM node:20-alpine AS theme-builder

WORKDIR /theme
COPY themes/laravelmix/package.json ./
RUN npm install --no-audit --no-fund
COPY themes/laravelmix/ ./
RUN npm run prod

# Stage 2: Install PHP dependencies
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    && composer dump-autoload --optimize

# Stage 3: Production image
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    sqlite-dev \
    && docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    zip \
    intl \
    opcache \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=theme-builder /theme/assets/dist ./themes/laravelmix/assets/dist

RUN rm -rf themes/laravelmix/node_modules \
    && chmod +x docker/entrypoint.sh \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/cms storage/app/uploads/public bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache themes/laravelmix/assets/dist

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

ENV APP_ENV=production \
    APP_DEBUG=false \
    ACTIVE_THEME=laravelmix \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/storage/database.sqlite \
    LOG_CHANNEL=stderr

EXPOSE 8080

ENTRYPOINT ["docker/entrypoint.sh"]
