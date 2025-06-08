import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('OrdersGateway');

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      const user = await this.userModel.findById(payload.id);      if (!user || !user.isActive) {
        client.disconnect();
        return;
      }

      client.userId = (user._id as any).toString();
      client.userRole = user.role;

      this.logger.log(`Cliente conectado: ${user.name} (${user.role}) - Socket ID: ${client.id}`);

    } catch (error) {
      this.logger.error('Error en autenticación WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Cliente desconectado: Socket ID: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { role: string; id: string },
  ) {
    const { role, id } = data;
    
    if (role === 'comprador') {
      client.join(`client-${id}`);
      this.logger.log(`Cliente ${client.userId} se unió a sala client-${id}`);
    } else if (role === 'locatario') {
      client.join(`shop-${id}`);
      this.logger.log(`Locatario ${client.userId} se unió a sala shop-${id}`);
    } else if (role === 'repartidor') {
      client.join(`delivery-${id}`);
      this.logger.log(`Repartidor ${client.userId} se unió a sala delivery-${id}`);
    }
  }

  @SubscribeMessage('update-location')
  handleUpdateLocation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() location: { lat: number; lng: number },
  ) {
    if (client.userRole === 'repartidor') {
      // Broadcast la ubicación actualizada a todos los clientes relevantes
      client.broadcast.emit('delivery-location-updated', {
        deliveryId: client.userId,
        location,
      });
      
      this.logger.log(`Ubicación actualizada para repartidor ${client.userId}`);
    }
  }

  // Método para emitir eventos desde el servicio
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  // Método para emitir a todos los clientes
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
