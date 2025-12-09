import { Home, Inbox, LogOutIcon, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { ROUTES } from '~/routes'

const items = [
  {
    title: 'Forms',
    url: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: 'Profile',
    url: ROUTES.DASHBOARD_ME,
    icon: Inbox,
  },
  {
    title: 'Statistics',
    url: ROUTES.DASHBOARD_STATISTICS,
    icon: Settings,
  },
  {
    title: 'Logout',
    url: ROUTES.LOGOUT,
    icon: LogOutIcon,
  },
] as const

export function AppSidebar() {
  const location = useLocation()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Form Builder</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link viewTransition to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
