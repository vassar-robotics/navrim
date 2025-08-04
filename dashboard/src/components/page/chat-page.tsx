import type React from 'react'
import PageLayout from '@/components/layout/page-layout'
import ChatInput from '@/components/common/chat/chat-input'
import Suggestions from '@/components/common/chat/suggestions'
import { useState } from 'react'
import ChatLogo from '@/components/common/chat/chat-logo'
import type { MessageType } from '@/components/common/chat/message'
import Thread from '@/components/common/chat/thread'

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const submitCurrentMessage = () => {
    setMessages([
      ...messages,
      {
        threadId: '1',
        messageId: '1',
        createdAt: new Date().toISOString(),
        role: messages.length === 0 ? 'system' : 'user',
        content: currentMessage,
      },
    ])
    setCurrentMessage('')
  }
  return (
    <PageLayout>
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
          {messages.length === 0 && <ChatLogo />}
          {messages.length > 0 && <Thread messages={messages} />}
          <ChatInput
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            submitCurrentMessage={submitCurrentMessage}
          />
          {messages.length === 0 && <Suggestions setCurrentMessage={setCurrentMessage} />}
        </div>
      </div>
    </PageLayout>
  )
}

export default ChatPage
