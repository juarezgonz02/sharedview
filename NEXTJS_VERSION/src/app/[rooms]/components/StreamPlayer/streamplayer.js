import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js';

const StreamPlayer = () => {
    
    const [loaded, setLoaded] = useState(false)
    const videoPlayer = useRef()

    const videoSrc = 'https://cph-msl.akamaized.net/hls/live/2000341/test/master.m3u8';
    //const videoSrc = 'http://live.sharedview.tk:3000/hls/web.m3u8';
    // Before check for m3u8 data
    
    
    const get_m3u8 = async () => {
        let testing;
        
        let fetching = setInterval(async () =>
            {
                testing = await fetch(videoSrc,
                {   
                    method: 'GET',
                    mode: 'cors',
                })
                
                console.log(testing.status);

                if(testing.status === 200){
                    hls_play();
                    clearInterval(fetching);
                    setLoaded(true)
                }
            
            }, 1000)
                
    
    }
        //
    const hls_play = () => {
    
        //
        // First check for native browser HLS support
        //
        console.log()
        if(videoPlayer.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.current.src = videoSrc;
            videoPlayer.current.addEventListener('loadedmetadata', function() {
                videoPlayer.current.play();
                });
                //
        // If no native HLS support, check if hls.js is supported
        //
        }else if (Hls.isSupported()) {
            
            const hls = new Hls();
            try{
                hls.loadSource(videoSrc);
            }catch(e){
                console.log("NO HAY, NO EXISTE")
            }
            hls.attachMedia(videoPlayer.current);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                //videoPlayer.current.play();
                videoPlayer.current.id="video-stream";
            });
        } 
    }
        
    useEffect(()=>{
        console.log(videoPlayer.current)
        get_m3u8()
    },[])
    
    
  return (
    <div className="video-container">

    <div id="video-stream-cont">
        <video autoPlay controls className="stream-video" ref={videoPlayer} ></video>

    </div>

  </div>  )
}

export default StreamPlayer