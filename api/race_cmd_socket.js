import WebSocket, {WebSocketServer} from 'ws';

const webSocketServer = new WebSocketServer({
    port: 8081,
});

function connectToWebSocket() {
    webSocketServer.on('connection', (socket, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`); // I know it's not secure
        // Extract the `client_id` from the URL query parameters
        const clientId = url.searchParams.get('client_id');
        console.log(`Received: ${clientId}`, clientId);
        if(clientId){
            socket.id = clientId;
        }
        socket.on('message', (message) => {
            //console.log('Client connected----------->', clientId,  url.searchParams);
            webSocketServer.clients.forEach((client) => {
                // Send a targeted event - useful for notification
                const msgObj = JSON.parse(message);
                if(msgObj.user_id && client.readyState === WebSocket.OPEN){
                    if(msgObj.user_id === client.id){
                        client.send(`${message}`);
                    }
                    return;
                }
                // Send a event
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
