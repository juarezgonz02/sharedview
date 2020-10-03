'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var express = require('express');
var app = express();
var socketIO = require('socket.io');
var fileServer = new(nodeStatic.Server)();
var https = require('https');
var fs = require('fs');

const options = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem')
};

const server = https.createServer(options,app).listen(443, function(){
  console.log("Express server listening on port 443" );
})



app.use("/",express.static("public"));

var io = socketIO.listen(server);
io.sockets.on('connection', function(socket) {

	console.log("Se conecto"+socket.id)
	console.log("En la room: "+JSON.stringify(socket.adapter.rooms[0]))
	socket.join("call")


  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    socket.broadcast.emit('message', message);
   });
socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });
  socket.on('bye', function(){
    console.log('received bye');
  });
  socket.on('mute', function(){
    socket.broadcast.emit('muted');
    console.log(socket.id + 'Me silencie');
  });
  socket.on('unmute', function(){
    socket.broadcast.emit('unmuted');
    console.log(socket.id + 'Está hablando');
  });
  socket.on('bradcast audio', (audiostream)=>{
     socket.to("call").emit('addAudioStream',audiostream)
  });

});

