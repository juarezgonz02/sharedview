'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var express = require('express');
var app = express();
var socketIO = require('socket.io');
var https = require('https');
var http = require('http');
var fileServer = new(nodeStatic.Server)();
var fs = require('fs');

const options = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem')
};

const server = http.createServer(app).listen(80, function(){
  console.log("Express server listening on port 443" );
})



app.use(express.static(__dirname+"/public/css"))
app.use("/",express.static("public"));
app.use("/test",express.static("test"));

var io = socketIO.listen(server);
var user_count = 0;
var rooms = []
var user_list = [];

io.sockets.on('connection', function(socket) {
  var user_name_connected;
	if(user_count!=2){
		user_count+=1;
	}else{
		user_count=0;
  }
  
  let actual_room;
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

  socket.on('create or join', function(room, user_name) {
    if(rooms.indexOf(room) == (-1)){
      console.log("Se creó una sala nueva")
      rooms.push(room)
      user_list.push([])
    }
    

    actual_room = room;

    console.log(JSON.stringify(rooms))

    const room_actual = rooms.indexOf(room);
    user_list[room_actual].push(user_name);

    console.log(JSON.stringify(user_list[room_actual]))
    log('Received request to create or join room ' + room);
    console.log("Se conecto: "+user_name);
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients;
    if(user_name==="WEBMASTER"&&room==="CLEAN UP"){
      soyAdmin();
      numClients = -1;

    }else{
      numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    }

    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    if(numClients === -1){
      console.log("REINICIAANDOO")
      socket.emit('erased');

    } else if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, user_list[room_actual]);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room,user_list[room_actual]);
      socket.join(room);
      socket.emit('joined',room,user_list[room_actual]);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
      user_list[room_actual].pop();
      console.log("--Intentando entrar a una Sala llena--");
    }
	console.log("En la room: "+JSON.stringify(room));
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
  
  socket.on("newMessage", (text, title)=>{
    io.sockets.to(actual_room).emit("newMessage", text, title)
  })

  socket.on('bradcast audio', (audiostream)=>{
     socket.to("call").emit('addAudioStream',audiostream)
  });
  socket.on("disconnect",()=>{
    console.log("User: "+user_name_connected+ " Se desconectó");

  })

});

const soyAdmin = () => {
  rooms = [];
  user_list = [];
  console.log("Se limpiaron los datos");
}
