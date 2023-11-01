var video = document.createElement('video');
video.id="video-stream";
video.className = "stream-video";
video.autoplay = true;
video.controls = true;

var videoSrc = 'http://live.sharedview.tk:3000/hls/web.m3u8';
// Before check for m3u8 data

//
async function get_m3u8(){
    let testing;
    let ready = false;
    
    let fetching = setInterval(async function()
        {
            testing = await fetch(videoSrc,
            {   
                method: 'GET',
                mode: 'cors',
            })
            
            console.log(testing.status);
            if(testing.status===200){
                document.querySelector("#video-stream-cont").appendChild(video);
                hls_play();
                clearInterval(fetching);
                ready = true;

            }
        
        }, 1000)
            

}
    //
function hls_play(){

    //
    // First check for native browser HLS support
    //
    if(video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', function() {
            video.play();
            });
            //
    // If no native HLS support, check if hls.js is supported
    //
    }else if (Hls.isSupported()) {
        
        var hls = new Hls();
        try{
            hls.loadSource(videoSrc);
        }catch(e){
            console.log("NO HAY NO EXISTE")
        }
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
    } 
}
    
get_m3u8();
