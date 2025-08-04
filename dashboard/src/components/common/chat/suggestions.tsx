import { Button } from '@/components/ui/button'

const suggestions = [
  'Please tell me about tools you can access',
  "What's SO-101 arm?",
  'List available models for me.',
  'Please inspect the robot connection status.',
]

const Suggestion: React.FC<{ suggestion: string; setCurrentMessage: (currentMessage: string) => void }> = ({
  suggestion,
  setCurrentMessage,
}) => {
  return (
    <Button
      variant="outline"
      className="rounded-full hover:cursor-pointer"
      onClick={() => setCurrentMessage(suggestion)}
    >
      {suggestion}
    </Button>
  )
}

const Suggestions: React.FC<{ setCurrentMessage: (currentMessage: string) => void }> = ({ setCurrentMessage }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <Suggestion key={`chat-suggestion-${index}`} suggestion={suggestion} setCurrentMessage={setCurrentMessage} />
      ))}
    </div>
  )
}

export default Suggestions
