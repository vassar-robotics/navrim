interface MessageType {
  threadId: string
  messageId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

const UserMessage: React.FC<{ message: MessageType }> = ({ message }) => {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[85%] flex-1 justify-end text-end sm:max-w-[75%]">
        <div className="inline-flex rounded-lg bg-primary px-3 py-2 text-start break-words whitespace-normal text-primary-foreground">
          {message.content}
        </div>
      </div>
    </div>
  )
}

const AssistantMessage: React.FC<{ message: MessageType }> = ({ message }) => {
  return (
    <div className="flex justify-start gap-3">
      <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
        <div className="inline-flex rounded-lg border bg-muted px-3 py-2 text-start break-words whitespace-normal text-foreground">
          {message.content}
        </div>
      </div>
    </div>
  )
}

const Message: React.FC<{ message: MessageType }> = ({ message }) => {
  switch (message.role) {
    case 'user':
      return <UserMessage message={message} />
    case 'assistant':
    case 'system':
      return <AssistantMessage message={message} />
    default:
      throw new Error(`Invalid message role: ${message.role}`)
  }
}

export type { MessageType }
export { Message }
