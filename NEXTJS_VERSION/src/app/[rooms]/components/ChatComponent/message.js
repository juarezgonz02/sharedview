
const MessageComponent = ({ isMe, time, messageText, messageTitle }) =>
{
    return (
        <div className={"message"}>
            {
                isMe && <span>{`${time} Yo: `}</span>
            }

            {
                !isMe && <span>{`${time} ${messageTitle}: `}</span>
            }

            <p>{messageText}</p>
        </div>
    )
  }

export default MessageComponent