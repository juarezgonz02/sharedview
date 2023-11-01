import express from 'express';
import http from 'http';
import { Server as socketIO } from 'socket.io'; // Import 'Server' from socket.io as 'socketIO'
import cors from 'cors'; // Import the 'cors' middleware

const app = express();
const server = http.createServer(app);

const io = new socketIO(server, { 
  cors: {
    origin: "http://localhost:3000"
}}); // Create a new instance of the 'Server' class

app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('newMessage', (data) => {
    console.log(data)
    io.in(data.room).except(data.fromSocket).emit("incoming-message", data)
  })
  
  socket.on('received', (data) => {

    console.log("received", data)
    
    io.to(data.toSocketId).emit("know-me", data.myUserId)

  })

  socket.on('offerToRoom', (data) => {

    console.log("offerToRoom", data)

    io.in(data.room).emit("new-peer", data)

    socket.join(data.room)

  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(80, () => {
  console.log('Listening on *:80');
});