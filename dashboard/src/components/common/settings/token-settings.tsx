import { HelpCircle, Save, CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const TokenSettings: React.FC<{
  title: string
  toolTip: string
  placeholder: string
  hint: React.ReactNode
}> = ({ title, toolTip, placeholder, hint }) => {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenSaved, setIsTokenSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate saving the token
    setTimeout(() => {
      setIsLoading(false)
      setIsTokenSaved(true)
      console.log('Saving token:', token)
      // TODO: Implement actual save functionality
    }, 1000)
  }

  return (
    <div className="space-y-4 px-6 py-2">
      <div className="space-y-2">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <label htmlFor="token" className="flex items-center gap-2 text-sm leading-none font-medium">
              {title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{toolTip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="text-sm text-gray-500">{hint}</div>
            <div className="flex gap-x-2">
              <Input
                id="token"
                type="password"
                placeholder={placeholder}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !token.trim()} className="shrink-0">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save token'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {isTokenSaved && (
        <div className="flex items-center gap-2 text-xs text-green-500">
          <CircleCheck className="h-4 w-4" />
          Token set
        </div>
      )}
    </div>
  )
}
