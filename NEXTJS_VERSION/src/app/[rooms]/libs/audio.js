const audio_remote = document.getElementById("remoteAudio");
const microfono_controler = document.getElementById("controler");
const audio_remote_state = {
    paused:true
}

const local_remote_state = {
    paused:true
}

const live_video = document.getElementById("video");

live_video.setSinkId("default").then(()=>{
	console.log(`Success, audio output device attached`);
});


////////////////////////////////////////////////////////
audio_remote.addEventListener("play",()=>{
    if(!ready){
        console.log("Cambio el reproductor")
        microfono_controler.className="controler_closed";
        ready = true;
        audio_remote.play();
    }
})

/*
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
})*/

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
    local_remote_state.paused=false;
    status_check=true;
}
const close_mic =()=>{
    audio_remote.pause();
    local_remote_state.paused = true;
    status_check = true;
    //microfono.load();
}

