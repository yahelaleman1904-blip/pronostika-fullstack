# Configuración de Notificaciones por WhatsApp y SMS (Twilio Sandbox)

El backend de Pronostika incluye integración lista para usar con el SDK de Twilio (`10.6.0`) a través de `TwilioService.java` y `QuinielaService.java`.

## 1. Activar Twilio WhatsApp Sandbox

1. Crea o inicia sesión en tu cuenta de Twilio y copia tu **Account SID** y **Auth Token**.
2. En el panel izquierdo entra a **Messaging -> Try it out -> Send a WhatsApp message**.
3. Desde cada celular de prueba envía por WhatsApp el mensaje de activación (`join <palabra-clave>`) al número **`+1 415 523 8886`**.

## 2. Configurar credenciales en el backend

Agrega tus credenciales en `backend/src/main/resources/application.properties` (o en `/home/yahel/pronostika/application-prod.properties` en el VPS):

```properties
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=tu_auth_token
twilio.phone-number=+10000000000
twilio.whatsapp-number=whatsapp:+14155238886
```

## 3. Normalización automática de números mexicanos

El usuario puede registrar su número en **Mi Perfil** como 10 dígitos (`9511234567`), con lada (`+529511234567`) o completo (`+5219511234567`). `TwilioService` convierte automáticamente:

- **WhatsApp:** formato `whatsapp:+521XXXXXXXXXX`
- **SMS:** formato `+52XXXXXXXXXX`

## 4. Flujo de prueba

1. Entra a **Mi Perfil -> Editar** y guarda el número de celular vinculado al Sandbox.
2. Ve a **Mi Quiniela**, elige uno o más partidos y haz clic en **Guardar mi Quiniela**.
3. En segundos llegará un WhatsApp con el folio, jornada y el listado detallado de partidos y predicciones elegidas.
