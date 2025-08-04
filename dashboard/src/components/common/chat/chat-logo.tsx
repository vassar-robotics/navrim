import { MessageSquareText } from 'lucide-react'

const ChatLogo: React.FC = () => {
  return (
    <div className="mb-12 flex flex-row items-center gap-3">
      <MessageSquareText className="h-9 w-9" />
      <span className="text-3xl font-bold">Chat with Navrim</span>
    </div>
  )
}

export default ChatLogo
