import {useEffect, useRef} from "react";

const RemoteStream = ({stream}) => {

    const remoteStream = useRef()

    useEffect(() => {
        console.log(stream)
        remoteStream.current.srcObject = stream
        remoteStream.current.play()
    }, []);

    return (
        <div className={"user"}>
            <audio className={"remoteAudio"} ref={remoteStream}> </audio>
        </div>
    );
};

export default RemoteStream;