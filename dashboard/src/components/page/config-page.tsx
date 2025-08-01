import { Key, Play } from 'lucide-react'
import PageLayout from '@/components/layout/page-layout'
import { HelpCircle, Save, CircleCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const ConfigCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white py-2">
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 leading-none font-semibold">
          {icon}
          {title}
        </div>
      </div>
      {children}
    </div>
  )
}

export const TokenSettings: React.FC<{
  title: string
  toolTip: string
  placeholder: string
  hint: React.ReactNode
  tokenType: string
}> = ({ title, toolTip, placeholder, hint, tokenType }) => {
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
        <form id={`${tokenType}-token-form`} onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <label htmlFor={`${tokenType}-token`} className="flex items-center gap-2 text-sm leading-none font-medium">
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
                id={`${tokenType}-token`}
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

const frameRateCandidates = ['12', '24', '30', '60', '120']
const codecCandidates = ['mp4v', 'avc1', 'hev1', 'hvc1', 'avc3', 'av01', 'vp09']

export const RecordSettings: React.FC = () => {
  const [videoHeight, setVideoHeight] = useState('240')
  const [videoWidth, setVideoWidth] = useState('320')
  const [frameRate, setFrameRate] = useState('30')
  const [codec, setCodec] = useState('avc1')

  return (
    <div className="space-y-4 px-6 py-2">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Video Height */}
        <div className="space-y-2">
          <Label htmlFor="video-height">Video Height (px)</Label>
          <Input id="video-height" type="number" value={videoHeight} onChange={(e) => setVideoHeight(e.target.value)} />
        </div>

        {/* Video Width */}
        <div className="space-y-2">
          <Label htmlFor="video-width">Video Width (px)</Label>
          <Input id="video-width" type="number" value={videoWidth} onChange={(e) => setVideoWidth(e.target.value)} />
        </div>

        {/* Frame Rate */}
        <div className="space-y-2">
          <Label htmlFor="frame-rate">Frame Rate (FPS)</Label>
          <Select value={frameRate} onValueChange={setFrameRate}>
            <SelectTrigger id="frame-rate" className="w-full">
              <SelectValue placeholder="Select FPS" />
            </SelectTrigger>
            <SelectContent>
              {frameRateCandidates.map((rate) => (
                <SelectItem key={`${rate}-fps`} value={rate}>
                  {rate} FPS
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Codec */}
        <div className="space-y-2">
          <Label htmlFor="codec">Video Codec</Label>
          <Select value={codec} onValueChange={setCodec}>
            <SelectTrigger id="codec" className="w-full">
              <SelectValue placeholder="Select codec" />
            </SelectTrigger>
            <SelectContent>
              {codecCandidates.map((codec) => (
                <SelectItem key={`${codec}-codec`} value={codec}>
                  {codec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export const ConfigPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="container mx-auto flex h-full flex-col items-start justify-start">
        <div className="w-full space-y-4">
          {/* API Key Settings */}
          <ConfigCard title="API Key Settings" icon={<Key className="h-5 w-5" />}>
            <TokenSettings
              title="Hugging Face token"
              toolTip="Your token is securely stored. It will be used to sync datasets and models to the Hugging Face hub."
              placeholder="hf_••••••••••••••••••••••••••••••••"
              hint={
                <p>
                  Go to{' '}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Hugging Face settings page
                  </a>{' '}
                  and create a token with <span className="font-semibold">Write access to content/settings</span> for
                  syncing datasets and models.
                </p>
              }
              key="huggingface-token"
              tokenType="huggingface"
            />
            <TokenSettings
              title="Weights and Biases token"
              toolTip="Your token is securely stored. It will be used to report training metrics to Weights and Biases."
              placeholder="•••••••••••••••••••••••••••••••••••"
              hint={
                <p>
                  Go to{' '}
                  <a
                    href="https://wandb.ai/authorize"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    WandB authorization page
                  </a>{' '}
                  and get your token.
                </p>
              }
              key="wandb-token"
              tokenType="wandb"
            />
            <TokenSettings
              title="OpenAI API Key"
              toolTip="Your API key is securely stored. It will be used to enable AI-powered features and chat functionality."
              placeholder="sk-••••••••••••••••••••••••••••••••"
              hint={
                <p>
                  Go to{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    OpenAI API keys page
                  </a>{' '}
                  and create a new API key. Make sure you have{' '}
                  <span className="font-semibold">sufficient credits or an active subscription</span> for using OpenAI
                  services.
                </p>
              }
              key="openai-token"
              tokenType="openai"
            />
          </ConfigCard>
          <ConfigCard title="Recording Settings" icon={<Play className="h-5 w-5" />}>
            <RecordSettings />
          </ConfigCard>
        </div>
      </div>
    </PageLayout>
  )
}
