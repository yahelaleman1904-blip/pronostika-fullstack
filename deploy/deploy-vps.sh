#!/usr/bin/env bash
set -euo pipefail

echo "==> 1. Actualizando repositorio..."
git pull origin main

echo "==> 2. Compilando backend Spring Boot..."
cd backend
./mvnw clean package -DskipTests
cp target/backend-*.jar /home/yahel/pronostika/pronostika-backend.jar

echo "==> 3. Compilando frontend React (produccion)..."
cd ../frontend
npm ci
npm run build
sudo rm -rf /var/www/pronostika/*
sudo cp -r dist/* /var/www/pronostika/

echo "==> 4. Reiniciando servicios..."
sudo systemctl restart pronostika-backend || true
sudo nginx -t && sudo systemctl reload nginx

echo "Despliegue completado en http://216.238.94.85:8088"
