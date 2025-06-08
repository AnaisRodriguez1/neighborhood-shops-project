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
