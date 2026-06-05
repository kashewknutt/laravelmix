#!/bin/sh
set -e

cd /var/www/html

mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/cms \
    storage/app/uploads/public \
    bootstrap/cache

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Sync Cloud Run env vars into .env (avoids key:generate vs APP_KEY env conflict)
patch_env() {
    key="$1"
    val=$(eval "printf '%s' \"\$$key\"")
    if [ -n "$val" ]; then
        grep -v "^${key}=" .env > .env.tmp || true
        mv .env.tmp .env
        printf '%s=%s\n' "$key" "$val" >> .env
    fi
}

for key in APP_KEY APP_ENV APP_DEBUG APP_URL ACTIVE_THEME DB_CONNECTION DB_DATABASE LOG_CHANNEL CACHE_STORE SESSION_DRIVER; do
    patch_env "$key"
done

if [ -z "$APP_KEY" ] && ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

DB_PATH="${DB_DATABASE:-$(grep '^DB_DATABASE=' .env | cut -d= -f2-)}"
if [ -n "$DB_PATH" ] && [ ! -f "$DB_PATH" ]; then
    mkdir -p "$(dirname "$DB_PATH")"
    touch "$DB_PATH"
fi

php artisan config:clear || true
php artisan cache:clear || true
php artisan october:migrate --force 2>/dev/null || php artisan migrate --force || true

if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
fi

# php-fpm runs as www-data — must own writable dirs (fixes cache/data/f0/60/ errors)
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

php-fpm -D
exec nginx -g 'daemon off;'
