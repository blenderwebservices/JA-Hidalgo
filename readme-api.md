# API Documentation - Jardines de Allende Hidalgo

Este documento detalla los endpoints actuales de la API de la plataforma. La API actual fue diseñada primordialmente para sincronizar el estado global de la base de datos con la Single Page Application (SPA) del Dashboard web.

Todas las rutas de la API actualmente se encuentran bajo el grupo de middleware `auth` en `routes/web.php`, lo que significa que **requieren una sesión web de Laravel activa (cookies de sesión)** para funcionar.

---

## 📡 Endpoints de Consulta (GET)

### 1. Obtener Estado Global de la Base de Datos
- **Endpoint**: `GET /api/db-state`
- **Descripción**: Extrae toda la información de la base de datos y la mapea en una estructura JSON en *camelCase* lista para ser procesada por JavaScript.
- **Respuesta Exitosa (200 OK)**:
```json
{
  "ja_departments": [
    {
      "id": "T1-101",
      "torre": "Torre 1",
      "tipo": "Departamento",
      "numero": "101",
      "contactoNombre": "Juan Pérez",
      "contactoRol": "propietario",
      "contactoEmail": "juan@example.com",
      "contactoCelular": "5551234567",
      "notas": "",
      "status": "normal",
      "conConvenio": false
    }
  ],
  "ja_transactions": [
    {
      "id": "tx_abc123",
      "deptoId": "T1-101",
      "fecha": "2026-07-01",
      "tipo": "abono",
      "concepto": "Pago de mantenimiento Julio",
      "mesCorrespondiente": "2026-07",
      "destinoAbono": "Cuenta Santander",
      "monto": 1500.00
    }
  ],
  "ja_water_readings": [],
  "ja_audit_log": [],
  "ja_money_destinations": [],
  "ja_expense_groups": [],
  "ja_expense_subgroups": [],
  "ja_payment_methods": [],
  "ja_expenses": [],
  "ja_notices": []
}
```

---

## 📥 Endpoints de Sincronización (POST)

Estos endpoints reciben un array en formato JSON y ejecutan un borrado (truncate) o actualización masiva en la base de datos, reemplazándola con el estado más reciente enviado desde el frontend.

Todos esperan un payload JSON estructurado de la siguiente forma:
```json
{
  "data": [ ... array de objetos ... ]
}
```
**Respuesta Exitosa General (200 OK):** `{"status": "success"}`

### 1. Sincronizar Propiedades
- **Endpoint**: `POST /api/sync-departments`
- **Comportamiento**: Actualiza masivamente los datos de contacto, notas y status de los departamentos.

### 2. Sincronizar Transacciones (Historial)
- **Endpoint**: `POST /api/sync-transactions`
- **Comportamiento**: Sobrescribe por completo la tabla de transacciones (Cargos y Abonos) con el array recibido.

### 3. Sincronizar Lecturas de Agua
- **Endpoint**: `POST /api/sync-water-readings`
- **Comportamiento**: Sobrescribe por completo la tabla de `water_readings`.

### 4. Sincronizar Egresos (Gastos) y Configuraciones
- `POST /api/sync-expenses` (Gastos realizados)
- `POST /api/sync-expense-groups` (Categorías mayores de gastos)
- `POST /api/sync-expense-subgroups` (Subcategorías)
- `POST /api/sync-payment-methods` (Métodos de pago)

### 5. Sincronizar Comunicación y Auditoría
- `POST /api/sync-notices` (Avisos y comunicados para los condóminos)
- `POST /api/sync-audit-log` (Bitácora de movimientos)

---

## 📱 Visión a Corto Plazo: Aplicación Móvil para Condóminos

Con el objetivo de crear una aplicación móvil nativa (iOS/Android) enfocada a los residentes (condóminos), el ecosistema actual de APIs deberá evolucionar para soportar un acceso remoto más estructurado.

### Consideraciones Estratégicas para la App Móvil:

1. **Autenticación Basada en Tokens (Sanctum / Passport)**:
   - *Actualmente*: La API usa cookies de sesión (orientado a navegadores web).
   - *Para la App*: Se requerirá instalar Laravel Sanctum para emitir Tokens (Bearer Token), permitiendo que la App Móvil mantenga sesiones persistentes sin depender de un navegador.

2. **Endpoints Filtrados por Usuario (Seguridad)**:
   - *Actualmente*: `/api/db-state` retorna **toda** la base de datos, y el navegador (JS) se encarga de filtrar qué mostrar (`window.currentUser`). Esto no es seguro para una App Móvil compilada.
   - *Para la App*: Se deberá crear un nuevo endpoint específico (ej. `GET /api/v1/mobile/mi-estado`) que, analizando el token del usuario activo, **únicamente** devuelva desde el servidor los datos del departamento vinculado, las transacciones propias y los avisos globales.

3. **Arquitectura RESTful**:
   - En lugar de enviar un JSON gigante de sincronización masiva (`sync-transactions`), la App Móvil debe consumir la API de manera atómica.
   - Ejemplos de futuros endpoints para la app:
     - `GET /api/v1/mobile/transactions` -> Historial de cargos y abonos propios.
     - `POST /api/v1/mobile/payments/report` -> Subir un comprobante de pago (depósito) desde la cámara del celular.
     - `GET /api/v1/mobile/notices` -> Obtener avisos vigentes.

4. **Notificaciones Push**:
   - Preparar la base de datos (tabla `users`) para almacenar "Device Tokens" de Firebase Cloud Messaging (FCM) o APNs de Apple, permitiendo enviar notificaciones instantáneas de cargos generados o recibos aprobados directamente a sus celulares.
