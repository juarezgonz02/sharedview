'use client'

import {createContext, useContext, useEffect, useState, useRef} from "react";
import io from "socket.io-client";
import {Peer} from "peerjs";

export const socketContext = createContext();

let socket;
let username = "TEST " + (Math.random()*999).toFixed(0);
let id
const SocketContext = ({room, children}) => {

    const peer = useRef();

    const [userMedia, setUserMedia] = useState(null)

    const mediaRef = useRef()

    const usersRef = useRef(new Map())

    const [usersList, setUsersList] = useState([])

    const [channelReady, setChannelStatus] = useState(false)

    const messagesState = useState([])

    const [messagesVals, setMessages] = messagesState

    const messages = useRef([])

    useEffect(() => {


        socket = io("http://localhost")

        console.log("Try connection")

        socket.on("connect", ()=>{
            console.log("Server Connected ")

            setChannelStatus(true)

            socket.on("new-peer", (data)=>{

                console.log("know", data.userId)

                const newPeerCall = peer.current.call(data.userId, mediaRef.current, {
                    metadata: {
                        username: username
                    }
                })

                newPeerCall.on('stream', function(stream) {
                    // `stream` is the MediaStream of the remote peer.
                    // Here you'd add it to an HTML video/canvas element.
                    usersRef.current.set(data.userId, {id: data.userId, username: data.username, media: stream, isMe: false})
                    setUsersList([...usersList, data.userId])

                    //usersRef.current.get(data.userId).media.current.srcObject = stream

                });

                socket.emit("received", {toSocketId: data.socketId, myUserId: id})
            })
        })


        socket.on("incoming-message", (data)=>{
            console.log("NEW MESSAGE", data)
            messages.current = [...messages.current, data]
            setMessages(messages.current)

        })

        socket.on("error", ()=>{
            console.log("Server Not found ")

        })

    }, []);

    const gotStream = (stream) => {
        console.log('Adding local stream.');
        mediaRef.current = stream
        setUserMedia(stream)
    }

    const getUserMedia = ()=> {

        (async ()=>{

            const stream = await navigator.mediaDevices.getUserMedia(
                { video: false, audio: true })

            gotStream(stream)
        })()

    }

    const getUserId = () =>{
        peer.current = new Peer( { debug: 1 })
    }

    const sendPeerOfferToOthers = (id) => {

        console.log("Send offer to room")

        socket.emit("offerToRoom", {
            userId: id,
            username: username,
            socketId: socket.id,
            room: room
        })

    }

    const setAnswerListener = () => {
        peer.current.on('open', (newId) => {

            id = newId

            usersRef.current.set(id, {id: id, username: username, media: mediaRef.current, isMe: true})

            setUsersList([...usersList, id])

            console.log('My peer ID is: ' + id);

            peer.current.on('call', (call) => {

                call.answer(mediaRef.current);

                call.on('stream', (stream) => {

                    usersRef.current.set(call.peer, {id: call.peer, username: call.metadata.username, media: stream, isMe: false})

                    setUsersList([...usersList, call.peer])
                });

                call.on("close", ()=>{

                    usersRef.current.delete(call.peer)

                    setUsersList([...usersList, call.peer])
                })
            });


            sendPeerOfferToOthers(newId)


        });
    };

    useEffect(() => {

        console.log("ChannelStatus", channelReady)

        if(channelReady){
            getUserMedia()
        }

    }, [channelReady])

    useEffect(() => {

        if(userMedia === null){
            return
        }
        getUserId()

        setAnswerListener()

    }, [userMedia])

    useEffect(()=>{

        console.log(usersRef.current)

    }, [usersRef.current])


    const socketUsages = {

        socketConnection: socket,
        media: userMedia,
        rtcPeer: peer,
        sendChatMessage: (message) => {
            messages.current = [...messagesVals, {room: room, msg: message, from: username, isMe: true }]
            setMessages(messages.current)
            socket.emit("newMessage", {room: room, msg: message, fromSocket: socket.id, from: username, isMe: false })
        },
        users: usersRef,
        messagesState: messagesState

    }


    return (
        <socketContext.Provider value={socketUsages}> {children} </socketContext.Provider>
    )
}

export default SocketContext