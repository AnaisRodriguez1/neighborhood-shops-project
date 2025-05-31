
import { Manager, Socket } from 'socket.io-client';


export const connectToServer = () => {
    console.log('Attempting to connect to WebSocket server...');
    const manager = new Manager('http://localhost:8080', {
        transports: ['websocket', 'polling']
    });

    const socket = manager.socket('/');

    addListeners(socket);
}

const addListeners = (socket: Socket) => {    const getServerStatusLabel = () => document.getElementById('server-status');
    const getClientsUl = () => document.querySelector('#clients-ul');

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        const serverStatusLabel = getServerStatusLabel();
        if (serverStatusLabel) {
            serverStatusLabel.innerHTML = 'online';
            serverStatusLabel.className = 'text-sm font-semibold text-green-600';
        }
    });    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        const serverStatusLabel = getServerStatusLabel();
        if (serverStatusLabel) {
            serverStatusLabel.innerHTML = 'offline';
            serverStatusLabel.className = 'text-sm font-semibold text-red-600';
        }
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
    });

    socket.on('clients-updated', (clients: string[]) => {
        console.log('Clients updated:', clients);
        const clientsUl = getClientsUl();
        if (clientsUl) {
            let clientsHtml = '';
            clients.forEach(clientsId => {
                clientsHtml += `<li class="text-xs bg-blue-100 px-2 py-1 rounded">${clientsId}</li>`;
            });
            clientsUl.innerHTML = clientsHtml;
            console.log('Updated clients UI with:', clientsHtml);
        } else {
            console.log('Client UL element not found');
        }
    });
}