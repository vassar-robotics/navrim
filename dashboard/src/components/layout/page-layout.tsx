import React from 'react'

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-1 items-center justify-center bg-background px-4 py-4 lg:px-6">{children}</div>
}

export default PageLayout
