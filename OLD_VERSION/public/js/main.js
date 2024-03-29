'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var ready = false;
var localStream;
var pc = new RTCPeerConnection();
var remoteStream;
var turnReady;
var status_check = false;
const audios_container = document.getElementById("remoteAudio-container");
const controller =  document.getElementById("controler");
var pcConfig= {
   'iceServers': [
           {"urls":["stun:stun.l.google.com:19302"]}
   ] };

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: false
};

/////////////////////////////////////////////
const userList = document.getElementById("u_list");
var  users_list
var socket = io.connect();

var room ="";
var user_name="";

do{
  user_name = prompt("Introduce tu nombre: ");
  room = prompt('Introduce el código de la sala: ');

}while(user_name=="" || room=="");


window.location.hash = room;
socket.emit('create or join', room, user_name);

console.log('Attempted to create or  join room', room);

const user_list_append = (user_list)=>{

  users_list = user_list;
  for(var i = 0; i<=userList.childElementCount;i++){
    userList.removeChild(userList.childNodes[i]);
  }
  console.log(user_list)
  user_list.map((name)=>{
    let user = document.createElement("div");
    user.className="user_name_item";
    let username = document.createTextNode(name);
    user.append(username); 
    userList.appendChild(user); 
  })
}

socket.on('created', function(room,user_list) {
 
  user_list_append(user_list);
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
  room = prompt('Esta sala está llena, ingrese otro código: ');
  socket.emit("create or join", room, user_name);
});

socket.on('join', function (room, user_list){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
  user_list_append(user_list);
});

socket.on('joined', (room,user_list)=>{
  console.log('joined: ' + room);
  user_list_append(user_list.reverse());
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});
socket.on('erased',function(){
  location.reload();
})

socket.on('connect',function(){
  socket.on('disconnect',function(){
    hangup();
  })
})
////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////
var audioOut;
var localAudio = document.querySelector('#localAudio');
var remoteAudio = document.querySelector('#remoteAudio');
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localAudio.srcObject = stream;
  sendMessage('got user media');
  socket.emit('broadcast audio',stream)
  if (isInitiator) {
    maybeStart();
  }
  
  var tracks = stream.getAudioTracks();
  console.log("ESTADO ORIGINAL:" + tracks[0].enabled );
  console.log(tracks.length );
  tracks[0].enabled = false;
  controller.addEventListener("click",()=>{
    if(ready){

      if(!tracks[0].enabled){
        tracks[0].enabled=true;
        controller.className="controler border border-green";
      }else{
        tracks[0].enabled=false;
        controller.className="controler_closed";
      }
      console.log("Nuevo estado:" + tracks[0].enabled );
    }

  })


}


if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');

};

/////////////////////////////////////////////////////////
////////NO TOCAR///////////////////////////////////////
////////NO TOCAR///////////////////////////////////////
////////NO TOCAR///////////////////////////////////////
////////NO TOCAR///////////////////////////////////////
////////NO TOCAR///////////////////////////////////////
/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}
function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteAudio.srcObject = remoteStream;
}
function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElem.srcObject = null;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);

}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}
