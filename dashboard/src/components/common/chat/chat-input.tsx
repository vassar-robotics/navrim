import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React from 'react'

const ChatInput: React.FC<{
  currentMessage: string
  setCurrentMessage: (currentMessage: string) => void
  submitCurrentMessage: () => void
}> = ({ currentMessage, setCurrentMessage, submitCurrentMessage }) => {
  return (
    <div className="w-full rounded-3xl border border-input bg-background p-2 shadow-xs">
      <Textarea
        id="chat-input"
        className="max-h-[160px] min-h-[44px] resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Ask me anything..."
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submitCurrentMessage()
          }
        }}
        value={currentMessage}
      />
      <div className="flex flex-row items-end justify-end gap-2 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipContent>Send message</TooltipContent>
            <TooltipTrigger asChild>
              <Button size="icon" className="h-8 w-8 rounded-full hover:cursor-pointer" onClick={submitCurrentMessage}>
                <ArrowUp />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default ChatInput
