import PageLayout from '@/components/layout/page-layout'
import { Camera } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CameraCardProps {
  id: string
  name: string
  status: 'online' | 'offline'
  imageUrl?: string
}

const CameraCard: React.FC<CameraCardProps> = ({ name, status, imageUrl }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
  }

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-card transition-shadow hover:shadow-lg dark:border-gray-800">
      {/* Camera Preview with 4:5 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <span className="text-xs text-white capitalize">{status}</span>
        </div>
      </div>

      {/* Camera Info */}
      <div className="px-4 py-2">
        <div className="mb-1 flex items-start justify-between">
          <h1 className="text-lg font-semibold text-foreground">{name}</h1>
        </div>

        {/* Control Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor={`stream-${name}`} className="cursor-pointer">
              Enable Stream
            </Label>
            <Checkbox id={`stream-${name}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const CameraPage: React.FC = () => {
  // Mock camera data - replace with actual data from your API
  const cameras: CameraCardProps[] = [
    {
      id: '1',
      name: 'Camera #0',
      status: 'online',
    },
    {
      id: '2',
      name: 'Camera #1',
      status: 'online',
    },
    {
      id: '3',
      name: 'Camera #2',
      status: 'online',
    },
    {
      id: '4',
      name: 'Camera #3',
      status: 'offline',
    },
    {
      id: '5',
      name: 'Camera #4',
      status: 'online',
    },
    {
      id: '6',
      name: 'Camera #5',
      status: 'online',
    },
  ]

  return (
    <PageLayout className="items-start">
      <div className="container mx-auto w-full">
        {/* Camera Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} {...camera} />
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
