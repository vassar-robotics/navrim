import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const frameRateCandidates = ['12', '24', '30', '60', '120']
const codecCandidates = ['mp4v', 'avc1', 'hev1', 'hvc1', 'avc3', 'av01', 'vp09']

export const RecordSettings: React.FC = () => {
  const [videoHeight, setVideoHeight] = useState('240')
  const [videoWidth, setVideoWidth] = useState('320')
  const [frameRate, setFrameRate] = useState('30')
  const [codec, setCodec] = useState('avc1')

  return (
    <div className="space-y-4 px-6 py-2">
      <div className="grid grid-cols-4 gap-4">
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
          <Label htmlFor="frame-rate">Recording Frame Rate (FPS)</Label>
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
