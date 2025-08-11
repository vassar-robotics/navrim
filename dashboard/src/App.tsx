import AppRouter from '@/components/common/app-router'
import { AuthProvider } from '@/components/context/auth'
import { swrGlobalConfig } from '@/lib/fetch/swr-config'
import React from 'react'
import { SWRConfig } from 'swr'

const App: React.FC = () => {
  return (
    <SWRConfig value={swrGlobalConfig}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SWRConfig>
  )
}

export default App
