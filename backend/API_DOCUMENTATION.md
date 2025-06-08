# Orders System API Documentation

## Overview
Sistema completo de pedidos con notificaciones en tiempo real usando WebSocket para una aplicación de tiendas de barrio.

## Base URL
```
http://localhost:8080/api
```

## WebSocket
```
ws://localhost:8080
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Juan Pérez",
  "rol": "comprador" // "comprador", "locatario", "presidente", "repartidor"
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Update Delivery Info (Repartidores only)
```http
PATCH /auth/delivery-info
Authorization: Bearer <token>
```

**Body:**
```json
{
  "vehicle": "motocicleta", // "bicicleta", "motocicleta", "auto"
  "isAvailable": true,
  "lat": 19.4326,
  "lng": -99.1332
}
```

### Get Available Delivery Persons
```http
GET /auth/delivery-persons/available
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Get All Delivery Persons
```http
GET /auth/delivery-persons
Authorization: Bearer <token>
Roles: presidente
```

---

## Orders Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "productId": "60f7b1b8e1a4e12345678901",
      "productName": "Coca Cola 600ml",
      "quantity": 2,
      "unitPrice": 25.00
    }
  ],
  "deliveryAddress": {
    "street": "Av. Insurgentes Sur 1234",
    "neighborhood": "Del Valle",
    "city": "Ciudad de México",
    "postalCode": "03100",
    "coordinates": {
      "lat": 19.4326,
      "lng": -99.1332
    }
  },
  "paymentMethod": "efectivo", // "efectivo", "tarjeta", "billetera_digital"
  "notes": "Tocar el timbre dos veces"
}
```

### Get All Orders (Admin)
```http
GET /orders
Authorization: Bearer <token>
Roles: presidente
```

### Get My Orders (Customer)
```http
GET /orders/my-orders
Authorization: Bearer <token>
```

### Get Orders by Shop
```http
GET /orders/shop/:shopId
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Get Orders by Delivery Person
```http
GET /orders/delivery-person/:deliveryPersonId
Authorization: Bearer <token>
Roles: repartidor, presidente
```

### Get My Deliveries (Delivery Person)
```http
GET /orders/my-deliveries
Authorization: Bearer <token>
Roles: repartidor
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Update Order Status
```http
PATCH /orders/:orderId/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "confirmado" // "pendiente", "confirmado", "preparando", "listo", "en_entrega", "entregado", "cancelado"
}
```

### Assign Delivery Person
```http
PATCH /orders/:orderId/assign-delivery
Authorization: Bearer <token>
Roles: locatario, presidente
```

**Body:**
```json
{
  "deliveryPersonId": "60f7b1b8e1a4e12345678902"
}
```

---

## WebSocket Events

### Connection
Los clientes se conectan automáticamente y se unen a salas basadas en su rol:
- `client-{userId}` - Para compradores
- `shop-{shopId}` - Para locatarios  
- `delivery-{userId}` - Para repartidores

### Events Sent to Client

#### order-created
Notifica cuando se crea un nuevo pedido.
```json
{
  "event": "order-created",
  "data": {
    "orderId": "60f7b1b8e1a4e12345678903",
    "orderNumber": "ORD-1701234567890-0001",
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@customer.com"
    },
    "total": 68.00,
    "status": "pendiente"
  }
}
```

#### order-status-updated
Notifica cambios de estado del pedido.
```json
{
  "event": "order-status-updated", 
  "data": {
    "orderId": "60f7b1b8e1a4e12345678903",
    "orderNumber": "ORD-1701234567890-0001",
    "status": "confirmado",
    "estimatedDeliveryTime": "2025-06-07T23:00:00.000Z"
  }
}
```

#### delivery-assigned
Notifica cuando se asigna un repartidor.
```json
{
  "event": "delivery-assigned",
  "data": {
    "orderId": "60f7b1b8e1a4e12345678903",
    "orderNumber": "ORD-1701234567890-0001",
    "deliveryPerson": {
      "id": "60f7b1b8e1a4e12345678902",
      "name": "Carlos Repartidor",
      "vehicle": "motocicleta"
    }
  }
}
```

### Events Received from Client

#### join-room
Unirse a una sala específica.
```json
{
  "event": "join-room",
  "room": "shop-60f7b1b8e1a4e12345678901"
}
```

#### update-location
Actualizar ubicación (solo repartidores).
```json
{
  "event": "update-location",
  "data": {
    "lat": 19.4326,
    "lng": -99.1332,
    "orderId": "60f7b1b8e1a4e12345678903"
  }
}
```

---

## Seed Data Endpoints

### Seed All Data
```http
GET /seed
Authorization: Bearer <token>
Roles: presidente
```

### Seed Delivery Persons Only
```http
GET /seed/delivery-persons
Authorization: Bearer <token>
Roles: presidente
```

### Seed Orders Only
```http
GET /seed/orders
Authorization: Bearer <token>  
Roles: presidente
```

### Clear Users
```http
DELETE /seed/users
Authorization: Bearer <token>
Roles: presidente
```

---

## Order Status Flow

1. **pendiente** - Pedido creado, esperando confirmación de la tienda
2. **confirmado** - Tienda confirmó el pedido
3. **preparando** - Pedido en preparación
4. **listo** - Pedido listo para entrega
5. **en_entrega** - Repartidor recogió el pedido
6. **entregado** - Pedido entregado al cliente
7. **cancelado** - Pedido cancelado

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Pedido no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Test Suite Documentation

### Descripción General
Este proyecto incluye una suite completa de tests JavaScript para verificar el funcionamiento de todos los componentes del sistema: autenticación, creación de órdenes, WebSockets y notificaciones en tiempo real.

### 🧪 Tests Disponibles

#### 1. `get-token.js` - Test de Autenticación
**Propósito:** Verifica que el endpoint de login funcione correctamente y devuelva un token JWT válido.

**Funcionalidades probadas:**
- ✅ Login con credenciales válidas
- ✅ Obtención de token JWT
- ✅ Validación de respuesta HTTP

**Ejecución:**
```bash
node get-token.js
```

#### 2. `test-user-setup.js` - Test de Configuración de Usuarios
**Propósito:** Verifica la configuración de usuarios y roles en el sistema.

**Funcionalidades probadas:**
- ✅ Listado de usuarios (si el endpoint está disponible)
- ✅ Login con diferentes roles de usuario
- ✅ Validación de roles (presidente, tienda, repartidor)

**Usuarios de prueba:**
- `presidente@test.com` - Rol: presidente
- `tienda1@test.com` - Rol: tienda  
- `carlos@test.com` - Rol: repartidor

**Ejecución:**
```bash
node test-user-setup.js
```

#### 3. `test-order.js` - Test de Creación de Órdenes
**Propósito:** Verifica que se puedan crear órdenes correctamente con productos reales.

**Funcionalidades probadas:**
- ✅ Obtención de tiendas disponibles
- ✅ Obtención de productos por tienda
- ✅ Creación de órdenes con productos válidos
- ✅ Validación de estructura de respuesta

**Flujo del test:**
1. Obtiene lista de tiendas
2. Busca tienda con productos disponibles
3. Selecciona primer producto disponible
4. Crea orden con datos de dirección de prueba

**Ejecución:**
```bash
node test-order.js
```

#### 4. `test-websocket.js` - Test Básico de WebSocket
**Propósito:** Verifica que las conexiones WebSocket funcionen correctamente.

**Funcionalidades probadas:**
- ✅ Conexión al namespace `/orders`
- ✅ Autenticación con JWT en WebSocket
- ✅ Unirse a salas de notificaciones
- ✅ Manejo correcto de desconexión

**Ejecución:**
```bash
node test-websocket.js
```

#### 5. `test-status-update.js` - Test de Actualizaciones de Estado
**Propósito:** Verifica que las notificaciones WebSocket funcionen al actualizar estados de órdenes.

**Funcionalidades probadas:**
- ✅ Creación de orden de prueba
- ✅ Actualizaciones de estado paso a paso
- ✅ Recepción de notificaciones WebSocket en tiempo real
- ✅ Validación de mensajes de notificación

**Estados probados:**
1. pendiente → confirmado
2. confirmado → preparando  
3. preparando → listo

**Ejecución:**
```bash
node test-status-update.js
```

#### 6. `test-websocket-complete.js` - Test Completo del Flujo
**Propósito:** Simula el flujo completo de una orden desde creación hasta entrega.

**Funcionalidades probadas:**
- ✅ Flujo completo de orden
- ✅ Todas las transiciones de estado
- ✅ Asignación de repartidor
- ✅ Notificaciones para todos los participantes

**Flujo completo:**
1. Crear orden (pendiente)
2. Confirmar orden (confirmado)
3. Preparar orden (preparando)
4. Marcar como listo (listo)
5. Asignar repartidor
6. Marcar como entregado (entregado)

**Ejecución:**
```bash
node test-websocket-complete.js
```

### 🚀 Scripts de Automatización

#### Ejecutar Todos los Tests
Para ejecutar todos los tests automáticamente:

**Opción 1: Script Node.js**
```bash
node run-all-tests.js
```

**Opción 2: Script PowerShell (Windows)**
```powershell
.\run-all-tests.ps1
```

### 📊 Resultados Esperados

**Suite completa exitosa:**
- ✅ 6/6 tests exitosos
- ✅ 0/6 tests fallidos  
- ✅ Tasa de éxito: 100%

**Salida típica:**
```
🚀 INICIANDO SUITE DE TESTS PARA NEIGHBORHOOD SHOPS
📊 RESUMEN DE RESULTADOS
✅ ÉXITO - get-token.js
✅ ÉXITO - test-user-setup.js  
✅ ÉXITO - test-order.js
✅ ÉXITO - test-websocket.js
✅ ÉXITO - test-status-update.js
✅ ÉXITO - test-websocket-complete.js
🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!
```

### 🛠️ Prerrequisitos para Ejecutar Tests

1. **Servidor Backend ejecutándose:**
   ```bash
   npm run start:dev
   ```

2. **Base de datos con datos semilla:**
   - Usuarios de prueba creados
   - Tiendas con productos disponibles
   - Configuración de WebSocket activa

3. **Dependencias instaladas:**
   ```bash
   npm install node-fetch socket.io-client
   ```

### 🔧 Configuración de Tests

**URLs configuradas:**
- API Base: `http://localhost:8080/api`
- WebSocket: `http://localhost:8080`
- Namespace: `/orders`

**Credenciales de prueba:**
- Email: `presidente@test.com`
- Password: `Password123`

### 📝 Notas Importantes

- Todos los tests se ejecutan contra datos reales de la base de datos
- Los tests crean órdenes reales que quedan guardadas
- Los WebSockets manejan autenticación JWT
- Todos los tests terminan automáticamente (no se quedan colgados)
- Incluyen manejo de errores y timeouts apropiados

### 🐛 Solución de Problemas

**Test se queda colgado:**
- Usar `Ctrl+C` para interrumpir
- Verificar que el servidor esté ejecutándose
- Revisar conexión a base de datos

**Errores de autenticación:**
- Verificar credenciales en la base de datos
- Confirmar que el endpoint `/api/auth/login` funcione

**Errores de WebSocket:**
- Verificar que el módulo de órdenes esté habilitado
- Confirmar configuración de CORS para WebSockets
