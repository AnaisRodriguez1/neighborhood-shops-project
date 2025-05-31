import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { DeliveryWsService } from './delivery-ws.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DeliveryWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss : Server;
  
  constructor(private readonly deliveryWsService: DeliveryWsService) {}
    handleConnection(client: Socket) {
    this.deliveryWsService.registerClient(client);
    console.log({conectados: this.deliveryWsService.getConnectedClients()});
    this.wss.emit('clients-updated', this.deliveryWsService.getConnectedClients());
  }

  
  handleDisconnect(client: Socket) {
    this.deliveryWsService.removeCLient(client.id);
    console.log({conectados: this.deliveryWsService.getConnectedClients()});
    this.wss.emit('clients-updated', this.deliveryWsService.getConnectedClients());
  }
}
