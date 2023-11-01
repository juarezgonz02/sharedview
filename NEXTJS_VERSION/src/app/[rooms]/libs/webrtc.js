'use strict';
export const JoinCall = async (stream, socket) => {


    const peerConnection = new RTCPeerConnection(STUN_SERVERS);
    // Now add your local media stream tracks to the connection
    peerConnection.addTrack(stream.getTracks()[0]);

    let sessionDescription = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(sessionDescription);

    socket.send('offer', sessionDescription);

    /*
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(async () => {
        const sessionDescription = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer)
        socket.send('answer', description, from_userid, to_userid);
      });

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
       */
}
/*
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var ready = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var status_check = false;

var pcConfig = {
    'iceServers': [
        { "urls": ["stun:stun.l.google.com:19302"] }
    ]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
};
var audioOut;


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
        xhr.onreadystatechange = function () {
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

    tracks.forEach(function (track) {
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

const audios_container = document.getElementById("remoteAudio-container");
const controller = document.getElementById("controler");

const userList = document.getElementById("u_list");
/////////////////////////////////////////////


var room = "";
var user_name = "";

do {
    user_name = prompt("Introduce tu nombre: ");
    room = prompt('Introduce el código de la sala: ');

} while (user_name == "" || room == "");


window.location.hash = room;

socket.emit('create or join', room, user_name);
console.log('Attempted to create or  join room', room);

const user_list_append = (user_list) => {

    users_list = user_list;
    for (var i = 0; i <= userList.childElementCount; i++) {
        userList.removeChild(userList.childNodes[i]);
    }
    console.log(user_list)
    user_list.map((name) => {
        let user = document.createElement("div");
        user.className = "user_name_item";
        let username = document.createTextNode(name);
        user.append(username);
        userList.appendChild(user);
    })
}

socket.on('created', function (room, user_list) {

    user_list_append(user_list);
    console.log('Created room ' + room);
    isInitiator = true;
});

socket.on('full', function (room) {
    console.log('Room ' + room + ' is full');
    room = prompt('Esta sala está llena, ingrese otro código: ');
    socket.emit("create or join", room, user_name);
});

socket.on('join', function (room, user_list) {
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
    user_list_append(user_list);
});

socket.on('joined', (room, user_list) => {
    console.log('joined: ' + room);
    user_list_append(user_list.reverse());
    isChannelReady = true;
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});
socket.on('erased', function () {
    location.reload();
})

socket.on('connect', function () {
    socket.on('disconnect', function () {
        hangup();
    })
})

////////////////////////////////////////////////



// This client receives a message
socket.on('message', function (message) {
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

 


window.onbeforeunload = function () {
    sendMessage('bye');

};



}
*/