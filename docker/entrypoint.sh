#!/bin/sh
set -e

cd /var/www/html

# Ensure writable directories
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/cms storage/app/uploads/public
chmod -R 775 storage bootstrap/cache

# Create .env from example if missing
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generate app key if not set
if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

# SQLite database for simple deployments
if [ "$DB_CONNECTION" = "sqlite" ] || grep -q '^DB_CONNECTION=sqlite' .env; then
    DB_PATH=$(grep '^DB_DATABASE=' .env | cut -d= -f2-)
    if [ -n "$DB_PATH" ] && [ ! -f "$DB_PATH" ]; then
        mkdir -p "$(dirname "$DB_PATH")"
        touch "$DB_PATH"
    fi
fi

php artisan config:clear
php artisan cache:clear
php artisan october:migrate --force || php artisan migrate --force

if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
fi

php-fpm -D
exec nginx -g 'daemon off;'
