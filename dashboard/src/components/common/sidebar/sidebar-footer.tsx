import type React from 'react'
import { SidebarFooter } from '@/components/ui/sidebar'
import SidebarUser from '@/components/common/sidebar/sidebar-user'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/components/context/auth'

const AppSidebarFooter: React.FC = () => {
  const { auth } = useAuth()

  return (
    <SidebarFooter>
      {/* User Section */}
      {auth?.session ? (
        <SidebarUser />
      ) : (
        <div className="flex flex-col gap-2 p-2">
          <Button variant="secondary" asChild className="w-full">
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button asChild className="w-full">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </SidebarFooter>
  )
}

export default AppSidebarFooter
