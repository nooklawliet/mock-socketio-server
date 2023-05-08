const PORT = 20002;
const KEY = 'client-2';

const { io } = require("socket.io-client");
const socket = io(`ws://localhost:${PORT}`, {
    reconnection: true,
    extraHeaders: {
        key: KEY
    }
});
const fs = require('fs');

socket.on('connect', () => {
    console.log(KEY, '-> socket.id:', socket.id);

    socket.on('message', (msg) => {
        console.log(KEY, ' - message:', msg);
    });
    socket.on("poc_ws_realm", (name, data) => {
        console.log('name:', name);
        console.log('data:', data);
        // fs.writeFileSync(`${KEY}-${Date.now()}.json`, data);
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnect reason:', reason);
    });
});

