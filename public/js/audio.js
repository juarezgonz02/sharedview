const audio_remote = document.getElementById("remoteAudio");
document.getElementById("localAudio").style.display = "none";
const microfono_controler=document.querySelector("#controler");
const audio_remote_state = {
    paused:true
}

const live_video = document.getElementById("video");
live_video.setSinkId("default").then(()=>{
	console.log(`Success, audio output device attached`);
});

var ready = false;
audio_remote.style.display = "none";
audio_remote.addEventListener("play",()=>{
    if(!ready){
        console.log("Cambio el reproductor")
        close_mic();
        microfono_controler.className="controler_closed";
        ready = true;
    }
})
microfono_controler.addEventListener("click",()=>{
    if(audio_remote_state.paused&&ready){
        socket.emit('unmute');
        audio_remote_state.paused=false;
        microfono_controler.className="controler";
    }else if(ready){
        socket.emit('mute');
        audio_remote_state.paused=true;

      microfono_controler.className="controler_closed";
    }
})

socket.on('muted', function() {
    close_mic();
    audio_remote_state.paused=true;
  });
socket.on('unmuted',()=>{
    open_mic();
    audio_remote_state.paused=false;
});
socket.on('addAudioStream', function(stream){
	audio_remote.srcObject = stream;
});
const open_mic =()=>{
    audio_remote.play();
    //microfono.load();
}
const close_mic =()=>{
    audio_remote.pause();
    //microfono.load();
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
