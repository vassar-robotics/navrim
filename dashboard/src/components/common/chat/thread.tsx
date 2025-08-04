import { Message, type MessageType } from '@/components/common/chat/message'

const Thread: React.FC<{ messages: MessageType[] }> = ({ messages }) => {
  return (
    <div className="relative flex w-full flex-1 flex-col space-y-4 overflow-y-auto pe-2">
      {messages.map((message) => (
        <Message key={message.messageId} message={message} />
      ))}
    </div>
  )
}

export default Thread
