#!/usr/bin/env bash
set -o errexit

echo "Iniciando proceso de build..."

# pip install -r requirements.txt
echo "Instalando dependencias..."
# pip install -r requirements.txt

echo "Recolectando archivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migraciones..."
python manage.py migrate

echo "Build finalizado correctamente."