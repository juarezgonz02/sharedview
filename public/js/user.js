const message_container  = document.getElementById("messages-container");
const message = document.getElementById("message");
const send = document.getElementById("send");

send.addEventListener("click",()=>{
    if(message.value!=""){
        socket.emit("newMessage",message.value, users_list[0]+" :")
        createMessage(message.value, users_list[0]+" :");
        message.value = "";
    }
});

message.addEventListener("keyup",(e)=>{
    if(e.key=="Enter" && message.value!=""){
        createMessage(message.value, users_list[0]+" :");
        socket.emit("newMessage",message.value, users_list[0]+" :")
        message.value = "";
    }
})

socket.on("newMessage",(text, title)=>{
    if(title != (users_list[0]+" :")){
        createMessage(text, title);
    }
})

function createMessage(message_text, message_title){
    let message_body;
    let message_header;
        message_header = message_title;
        let message_element = document.createElement("div")
        let message_header_cont = document.createElement("span")
        let message_body_cont = document.createElement("p");
        message_element.appendChild(message_header_cont);
        message_body = document.createTextNode(message_text)
            
        message_header_cont.appendChild(document.createTextNode(message_header))
        message_body_cont.appendChild(message_body)

        message_container.appendChild(message_header_cont);
        message_container.appendChild(message_body_cont);

}
