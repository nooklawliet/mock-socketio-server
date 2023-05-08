const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const PATH = require('path');
const server = http.createServer(app);
const PORT = 20002;
const { Server } = require("socket.io");
const io = new Server(server, {
    maxHttpBufferSize: 1e10,
    cors: true
});
const catalog = JSON.parse(fs.readFileSync('./db/catalog.json', 'utf-8'));
const category = JSON.parse(fs.readFileSync('./db/category.json', 'utf-8'));
const product_offering = JSON.parse(fs.readFileSync('./db/product_offering.json', 'utf-8'));

const chokidar = require('chokidar');
const watcher = chokidar.watch('./db_realm', {
    awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
    },
});
watcher
    .on('add', path => {
        try {
            console.log(`File ${path} has been added`);
            const filepath = PATH.join(__dirname, path);
            console.log('filepath:', filepath);
            const filename = PATH.parse(filepath).name;
            console.log('filename:', filename);
            if (fs.existsSync(filepath)) {
                const stat = fs.lstatSync(filepath);
                if (stat.isFile()) {
                    const file = fs.readFileSync(filepath, 'utf-8');
                    console.log('file:', file);
                    // const json = JSON.parse(file);
                    // console.log('json:', json);
                    io.emit('poc_ws_realm', filename, file);
                    console.log('send:', filepath);
                    fs.unlinkSync(filepath);
                }
            }
        } catch (error) {
            console.error(error);
        }
    })
    .on('change', path => console.log(`File ${path} has been changed`))
    .on('unlink', path => console.log(`File ${path} has been removed`));

app.get('/image/:name', (req, res) => {
    let filename = req.params.name;
    setTimeout(() => {
        console.log('GET', req.url);
        res.sendFile(__dirname + '/image/' + filename);
    }, 3000);
});
io.use((socket, next) => {
    console.log(`socket handshake:`, socket.handshake);
    next();
});

io.on('connection', (socket) => {
    console.log(`client: ${socket.id} connected`);
    let headers = socket.handshake.headers;
    console.log(`[${socket.id}] connection headers:`, headers);

    let pathImage = './image';
    let imageDirectory = fs.readdirSync(pathImage);
    for (const file of imageDirectory) {
        let filepath = PATH.join(pathImage, file);
        let stat = fs.statSync(filepath);
        let info = {
            name: file,
            size: stat.size,
            ext: PATH.extname(file)
        }
        console.log('file:', info);
        let img = fs.readFileSync(filepath);
        socket.emit('file', info, img);
    }

    socket.on('debug', (data) => {
        console.log('type:', typeof data, '- data:', data);
    });

    socket.on('command', (data, callback) => {
        console.log(`[${socket.id}] topic: command - data:`, data);
        let ack = { result: 'ack' }
        console.log(`[${socket.id}] ack:`, ack);
        callback(ack);
        setTimeout(() => {
            let event1 = {
                key: data.key,
                event: 'mfaf.deliveryAddressCreated',
                value: data.value
            }
            console.log(`[${socket.id}] emit topic: event - data:`, event1);
            socket.emit('event', event1);

            let event2 = {
                key: 'date',
                event: 'mfaf.aaa',
                value: new Date().toISOString()
            }
            console.log(`[${socket.id}] emit topic: event - data:`, event2);
            socket.emit('event', event2);

            let event3 = {
                key: data.key,
                event: 'mfaf.deliveryAddressCreated2',
                value: data.value
            }
            console.log(`[${socket.id}] emit topic: event - data:`, event3);
            socket.emit('event', event3);
        }, 5000);
    });

    socket.on('catalog', (msg, callback) => {
        console.log(`on catalog:`, msg);
        // console.log(`catalog:`, catalog);
        callback(catalog);
    });

    socket.on('category', (msg, callback) => {
        console.log(`on category:`, msg);
        // console.log(`category:`, category);
        callback(category);
    });

    socket.on('product_offering', (msg, callback) => {
        console.log(`on product_offering:`, msg);
        // console.log(`product_offering:`, product_offering);
        callback(product_offering);
    });    

    socket.on('disconnect', (reason) => {
        console.log(`client: ${socket.id} disconnected`);
    });

});

server.listen(PORT, () => {
    console.log('listening on port:', PORT);
});