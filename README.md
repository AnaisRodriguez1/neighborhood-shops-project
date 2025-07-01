# Neighborhood Shops Project

## Descripción
Este es el proyecto final del curso de Introducción a Desarrollo Web Móvil, desarrollado como parte de la formación de Ingeniería Civil en Computación e Informática. Es una plataforma de comercio electrónico local que conecta tiendas de barrio con clientes a través de un sistema de pedidos en tiempo real con entrega a domicilio.

## Integrantes del Equipo
- **Anais Rodríguez**
- **Manuel Jerez**
- **Tomás Vargas**

*Ingeniería Civil en Computación e Informática*

## Demostración en Vivo
Puedes acceder a la aplicación en funcionamiento en el siguiente enlace:
[https://frontend-neighborhood-shops-project-production.up.railway.app/](https://frontend-neighborhood-shops-project-production.up.railway.app/)

## Credenciales de Prueba
Para facilitar la evaluación del proyecto, puedes utilizar las siguientes credenciales de prueba:

### **Presidente (Administrador General)**
- **Email:** jose@gmail.com
- **Contraseña:** Abcd1234

### **Locatario (Dueño de Tienda)**
- **Email:** anais@gmail.com
- **Contraseña:** Abcd1234

### **Comprador (Cliente)**
- **Email:** kira@gmail.com
- **Contraseña:** Abcd1234

### **Repartidor (Delivery)**
- **Email:** andres@gmail.com
- **Contraseña:** Abcd1234

## Variables de Entorno para Desarrollo Local
Para que el profesor pueda probar el proyecto localmente, debe crear un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
PORT=8080
PORT_TEST=3000
JWT_SECRET=Est3EsMISE3DsecretoATM

MONGODB_URI=mongodb://mongo:nVMUVvFYGLdngixOzEgYqwobVwKdKtYP@switchyard.proxy.rlwy.net:50282/
MONGODB_TEST=mongodb://UserATMDB:MySecretPassWordProyectoATM@localhost:27017/ATMBD?authSource=admin

DEFAULT_LIMIT=10
DEFAULT_OFFSET=0
```

**Nota:** Estas variables incluyen la conexión directa a la base de datos en la nube, por lo que no es necesario configurar MongoDB localmente.

## Base de Datos
El proyecto utiliza **MongoDB Atlas** (MongoDB en la nube) como base de datos principal, lo que garantiza alta disponibilidad y escalabilidad sin necesidad de configuración local de base de datos.

## Estructura del Proyecto
Este proyecto está dividido en dos partes principales:
- **Backend**: API desarrollada con NestJS
- **Frontend**: Aplicación web desarrollada con React y TypeScript

## Tecnologías y Frameworks Utilizados

### **Frontend (React/TypeScript)**

#### **Framework Principal**
- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Herramienta de construcción y desarrollo

#### **Routing y Estado**
- **React Router DOM** - Navegación y enrutamiento
- **Context API** - Gestión de estado global (Auth, Cart, Theme)

#### **UI y Estilos**
- **Tailwind CSS** - Framework de utilidades CSS
- **PostCSS** - Procesador de CSS
- **Lucide React** - Iconos (Package, MapPin, Clock, etc.)

#### **Comunicación y Tiempo Real**
- **Socket.io Client** - WebSockets para tiempo real
- **Fetch API** - Peticiones HTTP (apiService)

#### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **TypeScript Compiler** - Compilación TypeScript

### **Backend (NestJS/Node.js)**

#### **Framework Principal**
- **NestJS** - Framework Node.js progresivo
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Lenguaje principal

#### **Base de Datos**
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **@nestjs/mongoose** - Integración Mongoose con NestJS

#### **Autenticación y Seguridad**
- **@nestjs/jwt** - Manejo de JWT
- **@nestjs/passport** - Estrategias de autenticación
- **passport** - Middleware de autenticación
- **passport-jwt** - Estrategia JWT para Passport
- **bcrypt** - Hash de contraseñas

#### **WebSockets y Tiempo Real**
- **@nestjs/websockets** - WebSockets en NestJS
- **Socket.io** - Comunicación en tiempo real
- **Real-time Notifications** - Sistema de notificaciones en tiempo real para pedidos

#### **Sistema de Entregas Avanzado**
- **Asignación Automática de Repartidores** - Sistema inteligente de asignación
- **Gestión de Disponibilidad** - Control de estado de repartidores
- **Toma de Pedidos Self-Service** - Repartidores pueden tomar pedidos disponibles
- **Tracking en Tiempo Real** - Seguimiento completo del estado de entregas

#### **Validación y Documentación**
- **@nestjs/swagger** - Documentación API automática
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de objetos

#### **Utilidades Backend**
- **slugify** - Generación de slugs
- **@nestjs/config** - Gestión de configuración
- **@nestjs/common** - Decoradores y utilidades comunes

#### **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Docker Compose** - Contenedorización de base de datos

## Arquitectura del Sistema

### **Arquitectura General**
```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐    Mongoose    ┌─────────────────┐
│   Frontend      │ ←─────────────────→  │    Backend      │ ←─────────────→ │    MongoDB      │
│   (React SPA)   │                      │   (NestJS API)  │                │   (Database)    │
└─────────────────┘                      └─────────────────┘                └─────────────────┘
```

### **Frontend - Arquitectura por Capas**
```
src/
├── components/          # Componentes reutilizables
│   ├── Layout/         # Header, navegación
│   └── OrderDetailModal.tsx
├── context/            # Estado global (React Context)
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
│   ├── useWebSocket.ts
│   └── useOrderNotifications.ts
├── pages/              # Páginas por módulo
│   ├── admin/          # Panel administrativo
│   ├── auth/           # Login/Register
│   ├── delivery/       # Repartidores
│   ├── orders/         # Gestión de pedidos
│   └── shop/           # Tiendas y productos
├── services/           # Servicios de API
│   └── api.ts
├── types/              # Definiciones TypeScript
│   └── index.ts
└── utils/              # Utilidades
    └── format.ts
```

### **Backend - Arquitectura Modular (NestJS)**
```
src/
├── auth/               # Módulo de autenticación
│   ├── decorators/     # @Auth(), @GetUser()
│   ├── guards/         # Guards de autorización
│   ├── strategies/     # JWT Strategy
│   └── entities/       # User entity
├── orders/             # Módulo de pedidos
│   ├── dto/           # Data Transfer Objects
│   ├── entities/      # Order entity (Mongoose)
│   ├── orders.gateway.ts  # WebSocket Gateway
│   ├── orders.service.ts  # Lógica de negocio
│   └── orders.controller.ts
├── shops/              # Módulo de tiendas
├── products/           # Módulo de productos
├── suppliers/          # Módulo de proveedores
└── common/             # Utilidades compartidas
    ├── helpers/
    └── dtos/
```

### **Patrones de Arquitectura Implementados**

#### **1. Arquitectura por Módulos (NestJS)**
- Cada funcionalidad está encapsulada en módulos independientes
- Inyección de dependencias automática
- Decoradores para routing, validación y autenticación

#### **2. Patrón Repository/Service**
- **Controllers**: Manejo de HTTP requests
- **Services**: Lógica de negocio
- **Entities**: Modelos de datos (Mongoose schemas)

#### **3. Real-time con WebSockets**
```typescript
// Gateway para eventos en tiempo real
@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: true, credentials: true }
})
export class OrdersGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() client, @MessageBody() data) {
    // Lógica de salas por rol
  }
}
```

#### **4. Autenticación Basada en Roles**
```typescript
// Guard personalizado para roles
@Auth(ValidRoles.locatario, ValidRoles.presidente)
@Get('pending')
findPendingOrders(@GetUser() user: AuthUser) {
  return this.ordersService.findPendingOrdersByShopOwner(user);
}
```

#### **5. Estado Global Reactivo (Frontend)**
```typescript
// Context para gestión de estado
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const CartContext = createContext<CartContextType | undefined>(undefined);
```

### **Estados de Pedidos**
El sistema maneja un flujo completo de estados para los pedidos:

```typescript
type OrderStatus = 
  | 'pendiente'    // Pedido creado, esperando confirmación
  | 'confirmado'   // Confirmado por la tienda
  | 'preparando'   // En preparación
  | 'listo'        // Listo para entrega
  | 'en_entrega'   // Asignado a repartidor
  | 'entregado'    // Completado
  | 'cancelado'    // Cancelado
```

### **Roles de Usuario**
- **Comprador**: Clientes que realizan pedidos
- **Locatario**: Dueños de tiendas
- **Presidente**: Administrador general
- **Repartidor**: Personal de entrega

### **Funcionalidades Clave**

#### **Sistema de Pedidos en Tiempo Real**
- Notificaciones WebSocket para todos los stakeholders
- Actualizaciones automáticas de estado
- Tracking de pedidos en tiempo real

#### **Gestión de Entregas Avanzada**
- **Asignación Manual y Automática** de repartidores
- **Sistema Self-Service** - Repartidores pueden tomar pedidos disponibles
- **Panel de Pedidos Disponibles** - Vista en tiempo real de pedidos listos para entrega
- **Gestión de Disponibilidad** - Control automático del estado de repartidores
- **Información Completa** de ubicación, vehículo y contacto
- **Historial Completo** de entregas por repartidor
- **Notificaciones en Tiempo Real** para asignaciones y cambios de estado

#### **Nuevas Funcionalidades de Entrega (Actualización 2025)**
- **Panel de Repartidor Mejorado** - Dashboard completo con métricas y estadísticas
- **Toma de Pedidos Autónoma** - Los repartidores pueden seleccionar pedidos disponibles
- **Sistema de Disponibilidad Inteligente** - Gestión automática del estado de repartidores
- **API Endpoints Especializados** para operaciones de entrega:
  - `getAvailableOrdersForDelivery()` - Pedidos listos para entrega
  - `takeOrder()` - Tomar un pedido disponible
  - `markAsDelivered()` - Marcar como entregado
  - `getAllMyDeliveries()` - Historial completo de entregas
- **Notificaciones Push** para nuevos pedidos disponibles
- **Métricas de Rendimiento** por repartidor

#### **Panel de Administración**
- Dashboard para locatarios y presidente
- Gestión de productos e inventario
- Reportes y estadísticas

#### **Sistema de Autenticación**
- JWT con roles y permisos granulares
- Guards personalizados por endpoint
- Información específica por tipo de usuario

### **Flujo de Datos Principal**
1. **Usuario interactúa** con componentes React
2. **Componentes llaman** a servicios API ([`apiService`](frontend/src/services/api.ts))
3. **API hace peticiones** HTTP al backend NestJS
4. **Controllers** validan y delegan a Services
5. **Services** ejecutan lógica y acceden a MongoDB Atlas
6. **WebSocket Gateway** emite eventos en tiempo real a todos los stakeholders
7. **Frontend recibe** actualizaciones vía [`useWebSocket`](frontend/src/hooks/useWebSocket.ts)
8. **Estado se actualiza** automáticamente en la UI
9. **Sistema de notificaciones** informa cambios a usuarios relevantes
10. **Repartidores reciben** notificaciones de pedidos disponibles automáticamente

### **Base de Datos - Modelos Principales**

#### **Order Entity**
```typescript
@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  totalAmount: number;
  
  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
  shop: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  client: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  deliveryPerson?: Types.ObjectId;
  
  @Prop({ type: String, enum: ['pendiente', 'confirmado', 'preparando', 'listo', 'en_entrega', 'entregado', 'cancelado'] })
  status: string;
}
```

#### **Shop Entity**
```typescript
@Schema({timestamps: true})
export class Shop extends Document {
  @Prop({ required: true, trim: true })
  name: string;
  
  @Prop({ type: [String], validate: { validator: (images: string[]) => images.length === 2 } })
  images: string[]; // [icono, dashboard]
  
  @Prop({ type: [String], enum: ['comida','electronica','ropa','libros','hogar'] })
  categories: string[];
}
```

### **Deployment y DevOps**
- **Railway** - Plataforma de deployment para ambos servicios (frontend y backend)
- **MongoDB Atlas** - Base de datos en la nube (MongoDB Database-as-a-Service)
- **Docker Compose** - Para desarrollo local opcional
- **Environment Variables** - Configuración por entorno
- **Vite Build** - Optimización del frontend para producción
- **Continuous Deployment** - Deploy automático desde repositorio Git

### **Seeds y Datos de Prueba**
El sistema incluye datos de prueba completos:
- Tiendas de ejemplo (Verdulería, Farmacia, Electromundo)
- Productos con imágenes y categorías
- Usuarios de prueba para todos los roles
- Pedidos de ejemplo con diferentes estados
- Repartidores con información de vehículos

## Instalación y Desarrollo

### Prerrequisitos
- **Docker y Docker Compose** (para la opción recomendada)
- Node.js 18+ y npm (para desarrollo manual)
- *(MongoDB Atlas ya configurado en la nube - no requiere instalación local)*

### 🐳 Opción 1: Desarrollo con Docker (Recomendado para Evaluación)

#### **Pasos para el Profesor:**

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd neighborhood-shops-project
   ```

2. **Crear archivo `.env` en el directorio `backend/`:**
   
   Copiar exactamente las variables mostradas al inicio de este README en un archivo llamado `.env` dentro de la carpeta `backend/`

3. **Ejecutar con Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación:**
   - **Frontend:** http://localhost:5173
   - **Backend:** http://localhost:8080
   - **API Docs:** http://localhost:8080/api/docs

**¡Todo listo! La aplicación usará la base de datos en la nube automáticamente.**

### ⚙️ Opción 2: Desarrollo Manual

#### Backend
```bash
cd backend
npm install

# Crear archivo .env con las variables mostradas al inicio del README

npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Configuración de Base de Datos
La base de datos **MongoDB Atlas** ya está configurada y funcionando en la nube. No es necesario instalar MongoDB localmente ni ejecutar Docker Compose para el desarrollo.

Para desarrollo local opcional con MongoDB local:
```bash
# En el directorio backend (opcional)
docker-compose up -d
```

### Acceso a la Aplicación
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8080
- **Documentación API:** http://localhost:8080/api/docs (Swagger)

### 🔧 Solución de Problemas Comunes

#### **Si Docker falla al construir:**
```bash
# Limpiar contenedores y volúmenes
docker-compose down --volumes
docker system prune -f

# Volver a construir
docker-compose up --build
```

#### **Si el backend no se conecta a la base de datos:**
- Verificar que el archivo `.env` esté en `backend/.env`
- Verificar que las variables de entorno estén copiadas exactamente como se muestran arriba
- La URI de MongoDB incluye credenciales y no requiere configuración adicional

#### **Puertos en uso:**
- Si el puerto 5173 está ocupado: `docker-compose up` usará el siguiente disponible
- Si el puerto 8080 está ocupado: modificar el puerto en `docker-compose.yml`

Esta arquitectura proporciona escalabilidad, mantenibilidad y una clara separación de responsabilidades entre las diferentes capas del sistema, permitiendo un desarrollo ágil y fácil mantenimiento del código.

---

*Proyecto desarrollado para el curso de Introducción a Desarrollo