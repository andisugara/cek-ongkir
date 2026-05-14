#!/bin/sh
set -e

# Allow using VITE_ prefixed env vars or direct ones
: "${RAJAONGKIR_URL:=${VITE_APP_RAJAONGKIR_URL}}"
: "${RAJAONGKIR_KEY:=${VITE_APP_RAJAONGKIR_KEY}}"
: "${TELEGRAM_BOT_TOKEN:=${VITE_APP_TELEGRAM_BOT_TOKEN}}"

export RAJAONGKIR_URL
export RAJAONGKIR_KEY
export TELEGRAM_BOT_TOKEN

envsubst '$RAJAONGKIR_URL $RAJAONGKIR_KEY $TELEGRAM_BOT_TOKEN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
