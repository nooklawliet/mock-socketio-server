const PORT = 20002;
const KEY = 'client-1';

const { io } = require("socket.io-client");
const socket = io(`ws://128.199.78.215:${PORT}`, {
    reconnection: true,
    // extraHeaders: {
    //     key: KEY
    // }
});
const fs = require('fs');

socket.on('connect', () => {
    console.log(KEY, '-> socket.id:', socket.id);

    socket.on('message', (msg) => {
        console.log(KEY, ' - message:', msg);
    });
    socket.on("poc_ws_realm", (data) => {
        console.log('data:', data);
        // fs.writeFileSync(`${KEY}-${Date.now()}.json`, JSON.stringify(data));
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnect reason:', reason);
    });
});

