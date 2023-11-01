'use client'

import {useContext, useEffect, useState} from "react";
import MessageComponent from "./message";
import { socketContext } from "@/app/[rooms]/components/socketContext";

const Chat = () => {

    const sendChatMessage = useContext(socketContext).sendChatMessage

    const [messages, setMessages] = useContext(socketContext).messagesState

    const send = (e) => {
        e.preventDefault()
        setMessages([{from: "Me", msg: e.target.message.value}])
        sendChatMessage(e.target.message.value)
        e.target.reset()
    }

    return <div className="chat-container">
        <div className="chat-header">
            <span>
                Mensajes
            </span>
        </div>

        <div id="messages-container" className="messages-container">
            {
                messages.map((message) => {
                    const currentTime = new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
                    return <MessageComponent key={currentTime+message.from} isMe={message.isMe} time={currentTime} messageText={message.msg} messageTitle={message.from} />
                })
            }
        </div>
        
        <form onSubmit={send} action="">
            <div id="message-writer">

                <input type="text" placeholder="Escribe tu mensaje" name="message" id="message" />
                <button aria-hidden="true" type="submit" id="send" >
                    <i className="far fa-paper-plane fa-2x send-ico" aria-hidden="true"></i>
                </button>
            </div>
        </form>
    </div>
}

export default Chat 