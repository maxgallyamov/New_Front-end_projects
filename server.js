server.js

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'typing') {
            broadcast({ type: 'typing', user: data.user });
        } else if (data.type === 'message') {
            broadcast({ type: 'message', message: data.message, user: data.user, isUser: data.isUser });
        }
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
