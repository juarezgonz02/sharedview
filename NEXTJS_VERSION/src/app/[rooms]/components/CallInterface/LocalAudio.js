import { useContext, useEffect, useRef, useState } from "react"
import { gotStream, JoinCall } from "../../libs/webrtc"
import { socketContext } from "../socketContext"
import { Peer } from "peerjs";

const LocalAudio = () => {

    const controller = useRef()

    const localAudio = useRef()

    const mediaUser = useContext(socketContext).media;

    useEffect(() => {
        if(mediaUser == null){
            return
        }
        console.log(mediaUser)
        localAudio.current.srcObject = mediaUser
    }, [mediaUser]);


    return (
        <div>
            <div className="controller-container">
                <div className="controller_waiting border border-warning" ref={controller} id="controller">
                </div>
            </div>
            <audio id="localAudio" ref={localAudio}></audio>
        </div>
    )
}

export default LocalAudio