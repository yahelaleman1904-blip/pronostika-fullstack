# Pronostika — Frontend (React + Vite + Tailwind CSS 4)

Aplicación SPA de **Pronostika** conectada al backend REST en Spring Boot (`/api`).

## Vistas implementadas

- **Autenticación (`LoginPage`):** inicio de sesión JWT, registro con verificación OTP por correo y recuperación de contraseña.
- **Predicciones (`DashboardPage` + `MatchTable`):** tabla paginada sincronizada con URL, buscador, filtros por liga y modal CRUD para roles `ADMIN` y `ANALISTA`.
- **Partidos y Detalle (`MatchCardsGrid` + `MatchDetailPage`):** tarjetas de la jornada con plantillas reales de ESPN y análisis táctico con Gemini AI.
- **Mi Quiniela (`DashboardPage` + `QuinielaHistory`):** selección de boleta (`LOCAL`, `EMPATE`, `VISITA`), persistencia en MySQL, historial desplegable y envío automático de resumen por WhatsApp/SMS.
- **Centro de Fútbol estilo Sofascore (`FootballHub`):** ligas y competiciones, tabla de posiciones con racha G/E/P, perfil de equipo, calendario con filtro en vivo y top de jugadores.
- **Mi Perfil y Administración (`ProfilePage` + `AdminUsersPage`):** edición de teléfono/avatar y gestión de roles de usuarios.

## Variables de entorno

| Archivo | Variable | Valor |
|---|---|---|
| `frontend/.env` (desarrollo local) | `VITE_API_URL` | `http://localhost:8085/api` |
| `frontend/.env.production` (VPS Nginx) | `VITE_API_URL` | `/api` |

## Comandos

```bash
cd frontend
npm install
npm run dev      # Desarrollo local
npm run build    # Compilación de producción en frontend/dist/
```
