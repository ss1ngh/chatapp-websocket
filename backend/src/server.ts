import ws, { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer( {port : 8080 });

interface CustomWebSocket extends WebSocket {
  isAlive: boolean;
}

wss.on('connection', (ws : CustomWebSocket) => {
    console.log('New user connected')
    ws.isAlive = true;

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    //listen for messages from this specific user
    ws.on('message', (data)=> {
        //data arrives as Buffer, convert to string
        const messageString = data.toString();
        console.log('Received : ', messageString);

        //broadcast message to all clients
        wss.clients.forEach((client) => {
            //client.readyState === 1 means connection is OPEN
            if(client.readyState === 1) {
                client.send(messageString);
            }
        })
    });

    ws.on('close', ()=> {
        console.log("User disconnected");
    })
});

console.log('Chat server is running on ws://localhost:8080');