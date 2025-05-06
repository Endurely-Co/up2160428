import {WebSocketServer} from 'ws';

const webSocketServer = new WebSocketServer({
    port: 8081,
});

function connectToWebSocket() {
    webSocketServer.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('message', (message) => {
            console.log(`Received: ${message}`);
            webSocketServer.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN) {
                    client.send(`${message}`);
                }
            });
        });


        socket.on('close', () => {
            console.log('Client disconnected');
        });

    });

    console.log('WebSocket server is running on ws://localhost:8081');
}

export default connectToWebSocket;
