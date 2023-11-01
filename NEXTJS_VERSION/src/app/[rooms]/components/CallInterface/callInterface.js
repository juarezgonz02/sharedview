import { useContext, useEffect, useRef, useState } from "react"
import { gotStream, JoinCall } from "../../libs/webrtc"
import { socketContext } from "../socketContext";
import LocalAudio from "./LocalAudio";
import P5Sketch from "@/app/[rooms]/libs/p5";
import RemoteStream from "@/app/[rooms]/components/CallInterface/RemoteStream";

const CallInterface = () => {

 const users_in_call = useContext(socketContext).users

  return (
    <div className="control-users-container">
      <div id="remoteAudio-container">
          {
              Array.from(users_in_call.current.values()).map((u) =>
                  u.isMe !== true && <>

                    <RemoteStream stream={u.media} id={u.id} key={`audioOf${u.id}`} />
                    <P5Sketch media={u.media} username={u.id} key={`audioOf${u.id}`} />
                  </>
              )
          }
          <LocalAudio />
      </div>


      <div className="UsersDisplay">
        <span>
          En la llamada:
        </span>

        <div className="userList" id="u_list">
          {
              Array.from(users_in_call.current.values()).map((u) =>
                  <div className="user_name_item" key={u.id}> {u.username} </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default CallInterface