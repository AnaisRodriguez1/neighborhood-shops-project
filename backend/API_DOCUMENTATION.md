# Neighborhood Shops API Documentation

## Overview
Sistema completo de gestión de pedidos para tiendas de barrio con notificaciones en tiempo real usando WebSocket. 

### Características Principales
- 🛍️ **Gestión de Tiendas**: CRUD completo para tiendas y productos
- 👥 **Sistema de Usuarios**: 4 roles (comprador, locatario, repartidor, presidente)
- 📦 **Pedidos Inteligentes**: Flujo completo desde creación hasta entrega
- 🔔 **Notificaciones en Tiempo Real**: WebSocket para updates instantáneos
- 🚚 **Tracking de Repartidores**: Ubicación en tiempo real
- 📊 **Panel Administrativo**: Métricas y gestión completa del sistema
- 🔐 **Autenticación JWT**: Seguridad robusta con roles y permisos

### Stack Tecnológico
- **Backend**: NestJS + MongoDB + Socket.IO
- **Frontend**: React + TypeScript + Tailwind CSS
- **Autenticación**: JWT + bcrypt
- **Base de Datos**: MongoDB con Mongoose
- **WebSockets**: Socket.IO para tiempo real

## Base URL
```
http://localhost:8080/api
```

## WebSocket
```
ws://localhost:8080
```

## Quick Start

### 1. Configuración Inicial
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run start:dev
```

### 2. Inicializar Base de Datos
```bash
# Crear datos de prueba (No requiere autenticación)
curl http://localhost:8080/api/seed/bootstrap
```

### 3. Obtener Token de Autenticación
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"presidente@test.com","password":"Password123"}'
```

### 4. Probar WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080/orders', {
  auth: { token: 'your-jwt-token' }
});

socket.emit('join-room', { role: 'comprador', id: 'user-id' });
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
  "rol": "comprador"
}
```

**Response:**
```json
{
  "id": "60f7b1b8e1a4e12345678901",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b1b8e1a4e12345678901",
    "name": "Juan Pérez",
    "email": "user@example.com",
    "role": "comprador",
    "isActive": true
  }
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

**Response:**
```json
{
  "id": "60f7b1b8e1a4e12345678901",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b1b8e1a4e12345678901",
    "name": "Juan Pérez",
    "email": "user@example.com",
    "role": "comprador",
    "isActive": true
  }
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

**Response:**
```json
[
  {
    "id": "60f7b1b8e1a4e12345678902",
    "name": "Carlos Repartidor",
    "email": "carlos@delivery.com",
    "vehicle": "motocicleta",
    "isAvailable": true,
    "currentLocation": {
      "lat": 19.4326,
      "lng": -99.1332
    }
  }
]
```

### Get All Delivery Persons
```http
GET /auth/delivery-persons
Authorization: Bearer <token>
Roles: presidente
```

### Get All Users (Admin)
```http
GET /auth/admin/users
Authorization: Bearer <token>
Roles: presidente
```

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)

### Delete User (Admin)
```http
DELETE /auth/admin/users/:id
Authorization: Bearer <token>
Roles: presidente
```

### Check Auth Status
```http
GET /auth/check-status
Authorization: Bearer <token>
```

---

## Orders Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Roles: comprador, presidente
```

**Body:**
```json
{
  "shopId": "60f7b1b8e1a4e12345678901",
  "items": [
    {
      "productId": "60f7b1b8e1a4e12345678901",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "Av. Insurgentes Sur",
    "number": "1234",
    "district": "Del Valle",
    "city": "Ciudad de México",
    "lat": 19.4326,
    "lng": -99.1332,
    "reference": "Edificio azul, segundo piso"
  },
  "paymentMethod": "efectivo",  "notes": "Tocar el timbre dos veces"
}
```

**Response:**
```json
{
  "id": "60f7b1b8e1a4e12345678903",
  "orderNumber": "ORD-1717977600000-0001",
  "shopId": "60f7b1b8e1a4e12345678901",
  "shop": {
    "id": "60f7b1b8e1a4e12345678901",
    "name": "Tienda Don Juan",
    "address": {
      "street": "Calle Principal",
      "number": "123",
      "district": "Centro"
    }
  },
  "client": {
    "id": "60f7b1b8e1a4e12345678904",
    "name": "Juan Pérez",
    "email": "juan@customer.com"
  },
  "items": [
    {
      "productId": "60f7b1b8e1a4e12345678905",
      "productName": "Coca Cola 600ml",
      "quantity": 2,
      "unitPrice": 25.00,
      "subtotal": 50.00
    }
  ],
  "total": 50.00,
  "status": "pendiente",
  "deliveryAddress": {
    "street": "Av. Insurgentes Sur",
    "number": "1234",
    "district": "Del Valle",
    "city": "Ciudad de México",
    "lat": 19.4326,
    "lng": -99.1332,
    "reference": "Edificio azul, segundo piso"
  },
  "paymentMethod": "efectivo",
  "notes": "Tocar el timbre dos veces",
  "deliveryPerson": null,
  "estimatedDeliveryTime": null,
  "createdAt": "2025-06-09T20:00:00.000Z",
  "updatedAt": "2025-06-09T20:00:00.000Z"
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

### Get All My Deliveries (Delivery Person)
```http
GET /orders/my-deliveries/all
Authorization: Bearer <token>
Roles: repartidor
```

### Get My Shop Pending Orders
```http
GET /orders/my-shop-orders/pending
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Get All My Shop Orders
```http
GET /orders/my-shop-orders/all
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Fix Product References (Admin)
```http
POST /orders/fix-product-references
Authorization: Bearer <token>
Roles: presidente
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

## Shops Endpoints

### Create Shop
```http
POST /shops
Authorization: Bearer <token>
Roles: locatario
```

**Body:**
```json
{
  "name": "Tienda Don Juan",
  "description": "Tienda de abarrotes del barrio",
  "address": {
    "street": "Calle Principal 123",
    "neighborhood": "Centro",
    "city": "Ciudad de México",
    "postalCode": "01000",
    "coordinates": {
      "lat": 19.4326,
      "lng": -99.1332
    }
  },
  "categories": ["abarrotes", "bebidas"],
  "deliveryAvailable": true,
  "pickupAvailable": true
}
```

### Get All Shops
```http
GET /shops
```

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "60f7b1b8e1a4e12345678901",
      "name": "Tienda Don Juan",
      "slug": "tienda-don-juan",
      "description": "Tienda de abarrotes del barrio",
      "address": {
        "street": "Calle Principal",
        "number": "123",
        "district": "Centro",
        "city": "Ciudad de México"
      },
      "categories": ["abarrotes", "bebidas"],
      "deliveryAvailable": true,
      "pickupAvailable": true,
      "isActive": true,
      "score": 4.5,
      "ownerId": "60f7b1b8e1a4e12345678903"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Get Shop by ID
```http
GET /shops/id/:id
```

### Get Shop by Slug
```http
GET /shops/slug/:slug
```

### Update Shop
```http
PATCH /shops/:id
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Delete Shop
```http
DELETE /shops/:id
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Delete Shop (Admin)
```http
DELETE /shops/admin/:id
Authorization: Bearer <token>
Roles: presidente
```

### Delete All Shops (Admin)
```http
DELETE /shops/delete-all
Authorization: Bearer <token>
Roles: presidente
```

### Get Shops by Owner
```http
GET /shops/owner/:ownerId
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Get My Shops
```http
GET /shops/my-shops
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Get Admin Metrics
```http
GET /shops/admin/metrics
Authorization: Bearer <token>
Roles: presidente
```

**Response:**
```json
{
  "overview": {
    "totalShops": 15,
    "totalOrders": 248,
    "totalUsers": 42,
    "averageShopScore": 4.32,
    "averageProductRating": 4.18,
    "recentOrders": 37
  },
  "ordersByStatus": {
    "pendiente": 8,
    "confirmado": 12,
    "preparando": 6,
    "listo": 4,
    "en_entrega": 3,
    "entregado": 210,
    "cancelado": 5
  },
  "usersByRole": {
    "comprador": 25,
    "locatario": 12,
    "repartidor": 4,
    "presidente": 1
  },
  "topShops": [
    {
      "id": "60f7b1b8e1a4e12345678901",
      "name": "Tienda Don Juan",
      "score": 4.8,
      "categories": ["abarrotes", "bebidas"],
      "owner": {
        "name": "Juan López",
        "email": "juan@tienda.com"
      }
    }
  ],
  "allShops": [
    {
      "id": "60f7b1b8e1a4e12345678901",
      "name": "Tienda Don Juan",
      "score": 4.8,
      "categories": ["abarrotes", "bebidas"],
      "isActive": true,
      "deliveryAvailable": true,
      "pickupAvailable": true,
      "address": {
        "street": "Calle Principal",
        "number": "123",
        "district": "Centro",
        "city": "Ciudad de México"
      },
      "owner": {
        "name": "Juan López",
        "email": "juan@tienda.com"
      },
      "createdAt": "2025-05-15T10:30:00.000Z",
      "updatedAt": "2025-06-09T15:45:00.000Z"
    }
  ]
}
```

---

## Products Endpoints

### Create Product
```http
POST /products
Authorization: Bearer <token>
Roles: locatario, presidente
```

**Body:**
```json
{
  "name": "Coca Cola 600ml",
  "description": "Refresco de cola",
  "price": 25.00,
  "category": "bebidas",
  "stock": 50,
  "shopId": "60f7b1b8e1a4e12345678901",
  "image": "https://example.com/coca-cola.jpg"
}
```

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "60f7b1b8e1a4e12345678905",
      "name": "Coca Cola 600ml",
      "description": "Refresco de cola",
      "price": 25.00,
      "category": "bebidas",
      "stock": 50,
      "image": "https://example.com/coca-cola.jpg",
      "rating": 4.2,
      "shopId": {
        "id": "60f7b1b8e1a4e12345678901",
        "name": "Tienda Don Juan"
      },
      "isActive": true
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Get Products by Shop
```http
GET /products/shop/:shopId
```

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)

### Get Product by ID
```http
GET /products/:id
```

### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
Roles: locatario, presidente
```

### Delete Product (Admin)
```http
DELETE /products/admin/:id
Authorization: Bearer <token>
Roles: presidente
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
    "shopId": "60f7b1b8e1a4e12345678901",
    "customer": {
      "id": "60f7b1b8e1a4e12345678904",
      "name": "Juan Pérez",
      "email": "juan@customer.com"
    },
    "items": [
      {
        "productId": "60f7b1b8e1a4e12345678905",
        "productName": "Coca Cola 600ml",
        "quantity": 2,
        "unitPrice": 25.00
      }
    ],
    "total": 50.00,
    "status": "pendiente",
    "deliveryAddress": {
      "street": "Av. Insurgentes Sur",
      "number": "1234",
      "district": "Del Valle",
      "city": "Ciudad de México"
    },
    "createdAt": "2025-06-09T20:00:00.000Z"
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
  "data": {
    "role": "locatario",
    "id": "60f7b1b8e1a4e12345678901"
  }
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

### Bootstrap Seed (No Auth Required)
```http
GET /seed/bootstrap
```
*Note: This endpoint doesn't require authentication and is used for initial system setup.*

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
  "message": [
    "El ID del producto es obligatorio",
    "La cantidad debe ser al menos 1"
  ],
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

### 409 Conflict
```json
{
  "message": "Ya existe una tienda con ese nombre o slug",
  "error": "Conflict",
  "statusCode": 409
}
```

### 500 Internal Server Error
```json
{
  "message": "Error interno del servidor",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

---

## API Features & Notes

### Pagination
Todos los endpoints que retornan listas soportan paginación:
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10, max: 100)

### Authentication
- Usa JWT (JSON Web Tokens) para autenticación
- Token debe incluirse en header: `Authorization: Bearer <token>`
- Tokens expiran en 24 horas

### Roles y Permisos
- **comprador**: Puede crear pedidos y ver sus propios pedidos
- **locatario**: Puede gestionar tiendas, productos y pedidos de sus tiendas
- **repartidor**: Puede ver y actualizar pedidos asignados
- **presidente**: Acceso completo a todas las funcionalidades

### Real-time Features
- WebSocket conectado en `/orders` namespace
- Notificaciones automáticas para cambios de estado
- Ubicación en tiempo real para repartidores
- Auto-join a salas basadas en rol de usuario

### Data Validation
- Validación estricta en todos los endpoints
- Mensajes de error descriptivos en español
- Sanitización automática de datos de entrada

### File Uploads
- Imágenes de productos soportan URLs externas
- Validación de formato y tamaño
- Optimización automática (si está configurada)

---

## Test Suite Documentation

### Descripción General
Este proyecto incluye una suite completa de tests JavaScript para verificar el funcionamiento de todos los componentes del sistema: autenticación, creación de órdenes, WebSockets y notificaciones en tiempo real.

### 🚀 Ejecución Rápida
```bash
# Ejecutar todos los tests
node run-all-tests.js

# Ejecutar test individual
node get-token.js
node test-order.js
```

### 📋 Prerequisites
1. **Servidor ejecutándose**: `npm run start:dev`
2. **Base de datos inicializada**: Ejecutar `/seed/bootstrap`
3. **Dependencias**: `npm install node-fetch socket.io-client`

### 🧪 Tests Disponibles

#### 1. `get-token.js` - Test de Autenticación
**Propósito:** Verifica el endpoint de login y obtención de tokens JWT.

**Validaciones:**
- ✅ Login exitoso con credenciales válidas
- ✅ Formato correcto del token JWT
- ✅ Datos de usuario en respuesta
- ✅ Status codes HTTP correctos

**Uso:**
```bash
node get-token.js
```

#### 2. `test-user-setup.js` - Test de Configuración de Usuarios
**Propósito:** Verifica la configuración y roles de usuarios del sistema.

**Validaciones:**
- ✅ Login con diferentes roles (presidente, tienda, repartidor)
- ✅ Validación de permisos por rol
- ✅ Estructura de respuesta de usuario

**Usuarios de prueba:**
- `presidente@test.com` - Control total del sistema
- `tienda1@test.com` - Gestión de tienda específica
- `carlos@test.com` - Funciones de repartidor

#### 3. `test-order.js` - Test de Creación de Órdenes
**Propósito:** Flujo completo de creación de órdenes con productos reales.

**Proceso:**
1. 🏪 Obtiene tiendas disponibles
2. 📦 Busca productos en stock
3. 🛒 Crea orden con datos válidos
4. ✅ Valida estructura de respuesta

**Validaciones:**
- ✅ Creación exitosa de pedidos
- ✅ Cálculo correcto de totales
- ✅ Asignación automática de número de orden
- ✅ Validación de productos disponibles

#### 4. `test-websocket.js` - Test Básico de WebSocket
**Propósito:** Conectividad y autenticación WebSocket.

**Validaciones:**
- ✅ Conexión al namespace `/orders`
- ✅ Autenticación JWT via WebSocket
- ✅ Join automático a salas por rol
- ✅ Manejo de desconexión

#### 5. `test-status-update.js` - Test de Actualizaciones en Tiempo Real
**Propósito:** Notificaciones WebSocket durante cambios de estado.

**Flujo de Estados Probado:**
1. `pendiente` → `confirmado`
2. `confirmado` → `preparando`
3. `preparando` → `listo`

**Validaciones:**
- ✅ Recepción de notificaciones en tiempo real
- ✅ Estructura correcta de mensajes WebSocket
- ✅ Sincronización entre API y WebSocket

#### 6. `test-websocket-complete.js` - Test de Flujo Completo
**Propósito:** Simulación completa del ciclo de vida de un pedido.

**Flujo Completo:**
1. 📝 Crear orden (`pendiente`)
2. ✅ Confirmar (`confirmado`)
3. 👨‍🍳 Preparar (`preparando`)
4. 📦 Listo para entrega (`listo`)
5. 🚚 Asignar repartidor
6. 🏃‍♂️ En entrega (`en_entrega`)
7. ✅ Entregado (`entregado`)

**Participantes:**
- 👨‍💼 Cliente (recibe notificaciones)
- 🏪 Tienda (gestiona orden)
- 🚚 Repartidor (actualiza ubicación)

### 📊 Resultados y Métricas

#### Salida Exitosa Típica:
```
🚀 INICIANDO SUITE DE TESTS PARA NEIGHBORHOOD SHOPS
========================================

✅ ÉXITO - get-token.js (1.2s)
✅ ÉXITO - test-user-setup.js (0.8s)
✅ ÉXITO - test-order.js (2.1s)
✅ ÉXITO - test-websocket.js (1.5s)
✅ ÉXITO - test-status-update.js (3.2s)
✅ ÉXITO - test-websocket-complete.js (4.8s)

📊 RESUMEN FINAL:
- Tests ejecutados: 6/6
- Tests exitosos: 6
- Tests fallidos: 0
- Tiempo total: 13.6s
- Tasa de éxito: 100%

🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!
```

### 🐛 Troubleshooting

#### Test Colgado o Timeout
```bash
# Interrumpir ejecución
Ctrl+C

# Verificar servidor
curl http://localhost:8080/api/auth/check-status

# Verificar base de datos
curl http://localhost:8080/api/seed/bootstrap
```

#### Errores de Autenticación
```bash
# Verificar credenciales
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"presidente@test.com","password":"Password123"}'
```

#### Errores de WebSocket
```bash
# Verificar configuración CORS
# Confirmar namespace '/orders' disponible
# Validar autenticación JWT en handshake
```

### 📝 Personalización

#### Cambiar Credenciales de Test
```javascript
// En los archivos de test
const testCredentials = {
  email: "tu-usuario@test.com",
  password: "tu-password"
};
```

#### Modificar Timeouts
```javascript
// Aumentar timeout para conexiones lentas
const timeout = 10000; // 10 segundos
```

### 🚀 Scripts de Automatización

#### Ejecutar Todos los Tests
Para ejecutar todos los tests automáticamente (multiplataforma):

```bash
node run-all-tests.js
```

**Compatible con:**
- ✅ Windows (PowerShell/CMD)
- ✅ Linux (Bash/Zsh)  
- ✅ macOS (Terminal)

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
