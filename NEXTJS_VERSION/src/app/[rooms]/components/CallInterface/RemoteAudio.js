import {useContext, useEffect, useState} from "react";
import {socketContext} from "@/app/[rooms]/components/socketContext";
import RemoteStream from "@/app/[rooms]/components/CallInterface/RemoteStream";

const RemoteAudio = ({media}) => {

    return (
        <div>
            <RemoteStream />
        </div>
    );
};

export default RemoteAudio;