# Pronostika

Plataforma web de pronósticos y quinielas de fútbol. Backend en **Spring Boot** con **MySQL 8** y **Flyway**, frontend en **React + Vite + Tailwind** (modo oscuro).

> Borrador del README: cada integrante completa la sección de su módulo.

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Backend | Java 17, Spring Boot 4, Spring Data JPA, Spring Security + JWT, Bean Validation, Flyway, Spring Mail, Twilio SDK |
| Base de datos | MySQL 8.0 (`pronostika_db`) |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, lucide-react |
| Pruebas de API | Bruno (`bruno/`) |

## Estructura del repositorio

```
pronostika-fullstack/
├── backend/                 API REST (Spring Boot)
│   └── src/main/
│       ├── java/com/pronostika/backend/
│       │   ├── config/      configuración (seguridad por método)
│       │   ├── controller/  controladores REST
│       │   ├── dto/         DTOs con Bean Validation
│       │   ├── entity/      entidades JPA (8 tablas)
│       │   ├── exception/   manejo global de errores
│       │   ├── repository/  repositorios Spring Data
│       │   └── service/     lógica de negocio (incluye TwilioService)
│       └── resources/
│           ├── db/migration/V1__schema.sql
│           ├── templates/   plantillas HTML de correo
│           └── application.properties.example
├── frontend/                SPA en React
├── database/diagrama-er.png Diagrama entidad-relación
└── bruno/                   Colección de pruebas de la API
```

## Base de datos

El esquema lo crea Flyway con `V1__schema.sql` (8 tablas): `roles`, `usuarios`, `ligas`, `partidos`, `pronosticos`, `quinielas`, `quiniela_partidos` (pivote N:M) y `tokens_invalidados`.

![Diagrama ER](database/diagrama-er.png)

## Puesta en marcha

### 1. Base de datos

```sql
CREATE DATABASE pronostika_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

1. Copia `backend/src/main/resources/application.properties.example` como `application.properties` (está en `.gitignore`, **no se sube**).
2. Llena tus datos locales: usuario y contraseña de MySQL, `jwt.secret` y, si los tienes, los datos de Twilio.
3. Ejecuta desde `backend/`:

```bash
./mvnw spring-boot:run          # Linux / macOS / Git Bash
mvnw.cmd spring-boot:run        # Windows (CMD o PowerShell)
```

La API queda en `http://localhost:8080/api`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opcional: crea `frontend/.env` con `VITE_API_URL=http://localhost:8080/api` si el backend corre en otra dirección.

## Endpoints de los módulos

Todas las respuestas usan DTOs; nunca se exponen entidades JPA. Los errores siguen el formato `{ timestamp, status, error, mensaje, ruta, campos }`.

### Administración de usuarios (`ROLE_ADMIN`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/usuarios?buscar=&page=0&size=10&sort=nombre,asc` | Listado paginado en servidor con filtro por nombre o correo |
| GET | `/api/admin/usuarios/roles` | Roles disponibles |
| GET | `/api/admin/usuarios/{id}` | Detalle de un usuario |
| POST | `/api/admin/usuarios` | Alta de usuario |
| PUT | `/api/admin/usuarios/{id}` | Edición de datos |
| PATCH | `/api/admin/usuarios/{id}/rol` | Cambio de rol (`ADMIN`, `ANALISTA`, `USUARIO`) |
| DELETE | `/api/admin/usuarios/{id}` | Eliminación |

### Quinielas (usuario autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/quinielas?page=0&size=10` | Mis quinielas, más recientes primero |
| GET | `/api/quinielas/{id}` | Detalle con partidos (dueño o admin) |
| POST | `/api/quinielas` | Guarda la quiniela y sus partidos (N:M) y envía confirmación por SMS y WhatsApp |

### Perfil (usuario autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/perfil` | Datos del usuario en sesión |
| PUT | `/api/perfil` | Edita teléfono (para SMS/WhatsApp) y avatar |

## Notificaciones

- **Twilio** (`TwilioService`): `enviarSms` y `enviarWhatsapp`. Si las credenciales están vacías o con los valores de ejemplo, solo deja un aviso en el log y la operación continúa.
- **Correo**: plantillas en `backend/src/main/resources/templates/` (`bienvenida.html`, `recuperar-password.html`, `confirmacion-quiniela.html`) con variables `{{nombre}}`, `{{folio}}`, etc.

## Pruebas con Bruno

1. Abre Bruno → *Open Collection* → carpeta `bruno/`.
2. Selecciona el entorno **Local** y escribe `adminPassword` y `usuarioPassword` (variables secretas, se guardan solo en tu equipo).
3. Ejecuta primero `01-auth` para guardar los JWT y después el resto de carpetas. `05-errores` contiene los casos 400, 401, 403, 404 y 409.

## Equipo

| Integrante | Módulos |
|------------|---------|
| Carlos Yahel Alemán Cruz | Estructura base, esquema Flyway, frontend inicial |
| Mario Eduardo Grajales Ramírez | Admin de usuarios, quinielas, perfil, Twilio, plantillas de correo, diagrama ER, colección Bruno |
