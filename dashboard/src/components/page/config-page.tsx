import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfigurationApi, type TokenType } from '@/lib/api/configuration'
import { type GetTokenResponse } from '@/protocol/response'
import { Key, Play, Trash } from 'lucide-react'
import { CircleCheck, HelpCircle, Save, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

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
  tokenType: TokenType
}> = ({ title, toolTip, placeholder, hint, tokenType }) => {
  const [tokenInput, setTokenInput] = useState('')

  const {
    data: tokenData,
    isLoading: isGettingToken,
    mutate: refreshToken,
  } = useSWR<GetTokenResponse>(
    `/config/token/${tokenType}/get`,
    () => ConfigurationApi.getToken(tokenType as TokenType),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      onError: (error) => toast.error(`Failed to get token: ${error.message}`),
    }
  )

  // Sync tokenData to tokenInput when the page displays or tokenData changes
  useEffect(() => {
    setTokenInput(tokenData?.token || '')
  }, [tokenData])

  const { trigger: updateToken, isMutating: isUpdatingToken } = useSWRMutation(
    `/config/token/${tokenType}/update`,
    async (_key: string, { arg }: { arg: string }) => {
      await ConfigurationApi.updateToken(tokenType, arg)
      await refreshToken()
      return true
    },
    {
      onSuccess: () => toast.success(`${tokenType} token saved successfully`),
      onError: (error) => toast.error(`Failed to save token: ${error.message}`),
    }
  )

  const { trigger: deleteToken, isMutating: isDeletingToken } = useSWRMutation(
    `/config/token/${tokenType}/delete`,
    async () => {
      await ConfigurationApi.deleteToken(tokenType)
      await refreshToken()
      return true
    },
    {
      onSuccess: () => {
        toast.success(`${tokenType} token deleted successfully`)
        setTokenInput('')
      },
      onError: (error) => toast.error(`Failed to delete token: ${error.message}`),
    }
  )

  const { trigger: verifyToken, isMutating: isVerifyingToken } = useSWRMutation(
    `/config/token/${tokenType}/verify`,
    async (_key: string, { arg }: { arg: string }) => {
      return ConfigurationApi.verifyToken(tokenType, arg)
    },
    {
      onSuccess: (data) => {
        data?.valid ? toast.success(`${tokenType} token is valid`) : toast.error(`${tokenType} token is invalid`)
      },
      onError: (error) => toast.error(`Failed to verify token: ${error.message}`),
    }
  )

  const isTokenSaved = !!tokenData?.token
  const isProcessing = isGettingToken || isUpdatingToken || isDeletingToken || isVerifyingToken
  const canSave = tokenInput.trim() && !isProcessing
  const canVerify = tokenInput.trim() && !isProcessing

  return (
    <div className="space-y-4 px-6 py-2">
      <div className="space-y-2">
        <form
          id={`${tokenType}-token-form`}
          onSubmit={async (e) => {
            e.preventDefault()
            await updateToken(tokenInput)
          }}
          className="space-y-2"
        >
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
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoComplete="off"
                className="flex-1"
              />
              <Button type="submit" disabled={!canSave} className="shrink-0">
                <Save className="mr-2 h-4 w-4" />
                {isUpdatingToken ? 'Saving...' : 'Save token'}
              </Button>
              {canVerify && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => await verifyToken(tokenInput)}
                  disabled={isVerifyingToken}
                  className="shrink-0"
                >
                  <Shield className="h-4 w-4" />
                  {isVerifyingToken ? 'Verifying...' : 'Verify'}
                </Button>
              )}
              {isTokenSaved && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => await deleteToken()}
                  disabled={isDeletingToken}
                  className="shrink-0"
                >
                  <Trash className="h-4 w-4" />
                  {isDeletingToken ? 'Deleting...' : 'Delete'}
                </Button>
              )}
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
