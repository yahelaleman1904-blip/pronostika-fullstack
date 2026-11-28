# Despliegue en VPS Ubuntu (Vultr)

Esta carpeta contiene los archivos de referencia utilizados para desplegar **Pronostika** en Ubuntu Server con Nginx, MySQL 8 y Spring Boot.

## Arquitectura de puertos

| Servicio | Puerto | Acceso |
|---|---|---|
| Nginx (Frontend SPA + Reverse Proxy `/api`) | `8088` | Público (`http://216.238.94.85:8088`) |
| Spring Boot Backend (`pronostika-backend.jar`) | `8085` | Interno (`127.0.0.1:8085`) |
| MySQL 8 (`pronostika_db`) | `3306` | Interno (`localhost:3306`) |

## Instalación de Nginx

```bash
sudo cp deploy/nginx-pronostika.conf /etc/nginx/sites-available/pronostika
sudo ln -sf /etc/nginx/sites-available/pronostika /etc/nginx/sites-enabled/pronostika
sudo nginx -t
sudo systemctl reload nginx
```

> Nota: `proxy_set_header Host $http_host;` es obligatorio para conservar el puerto `8088` en las peticiones hacia Spring Security y evitar rechazos `403` de CORS.

## Instalación del servicio systemd

```bash
sudo cp deploy/pronostika-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pronostika-backend
sudo systemctl status pronostika-backend
```
