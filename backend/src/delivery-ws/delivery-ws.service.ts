import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClient {
    [id: string]:Socket
}

@Injectable()
export class DeliveryWsService {

    private connectedClients : ConnectedClient = {}

    registerClient(client: Socket) {
        this.connectedClients[client.id] = client;
    }

    removeCLient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients() : string[] {
        return Object.keys(this.connectedClients);
    }
}
