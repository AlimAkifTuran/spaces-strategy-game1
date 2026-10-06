const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../')));

const gameState = {
    players: {},
    minerals: [
        { id: 1, x: 200, y: 150, amount: 200 },
        { id: 2, x: 600, y: 200, amount: 200 },
        { id: 3, x: 400, y: 500, amount: 200 }
    ]
};

io.on('connection', (socket) => {
    console.log(`Bir oyuncu bağlandı: ${socket.id}`);

    // Yeni oyuncuyu başlat
    gameState.players[socket.id] = {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        iron: 50,
        radius: 12
    };

    socket.emit('init', { id: socket.id, state: gameState });

    // Oyuncudan hareket komutu gelirse
    socket.on('move', (data) => {
        let player = gameState.players[socket.id];
        if (player) {
            let speed = 4;
            if (data.up) player.y -= speed;
            if (data.down) player.y += speed;
            if (data.left) player.x -= speed;
            if (data.right) player.x += speed;
        }
    });

    socket.on('disconnect', () => {
        console.log(`Oyuncu ayrıldı: ${socket.id}`);
        delete gameState.players[socket.id];
    });
});

// Saniyede 30 kez oyun durumunu her iki oyuncuya da yayınla
setInterval(() => {
    io.emit('updateState', gameState);
}, 1000 / 30);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
