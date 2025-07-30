import { Key, Play } from 'lucide-react'
import PageLayout from '@/components/layout/page-layout'
import { ConfigCard } from '@/components/common/settings/settings-card'
import { TokenSettings } from '@/components/common/settings/token-settings'
import { RecordSettings } from '@/components/common/settings/record-settings'

export const ConfigPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="flex h-full w-full flex-col items-start justify-start">
        <div className="w-full space-y-8">
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
