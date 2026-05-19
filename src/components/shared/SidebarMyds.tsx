import {
  ArrowBackIcon,
  ArrowForwardIcon,
  BookIcon,
  DatabaseIcon,
  DocumentFilledIcon,
  GridIcon,
  SettingIcon,
  UserGroupIcon,
} from '@govtechmy/myds-react/icon'
import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_PERMISSIONS, USER_ROLES, type UserRole } from '../../models/userRoles'
import BarChart from '@/assets/Icons/BarChart'

interface SidebarProps {
  mobileSidebar?: string
  onclick?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  activeStates: string[]
  roles: string[]
}

const menuItems: Omit<MenuItem, 'roles'>[] = [
  {
    id: 'paparan-utama',
    label: 'Paparan Utama',
    icon: GridIcon,
    path: '',
    activeStates: [''],
  },
  {
    id: 'data-teras',
    label: 'Data Teras',
    icon: DatabaseIcon,
    path: 'data-teras',
    activeStates: ['data-teras'],
  },
  {
    id: 'data-koleksi',
    label: 'Koleksi',
    icon: DocumentFilledIcon,
    path: 'data-koleksi',
    activeStates: ['data-koleksi'],
  },
  {
    id: 'statistik-teras',
    label: 'Statistik',
    icon: BarChart,
    path: 'statistik-teras',
    activeStates: ['statistik-teras'],
  },
  {
    id: 'tetapan-admin',
    label: 'Tetapan Pentadbir',
    icon: SettingIcon,
    path: 'tetapan-admin',
    activeStates: ['tetapan-admin'],
  },
  {
    id: 'urus-pengguna',
    label: 'Urus Pengguna',
    icon: UserGroupIcon,
    path: 'urus-pengguna',
    activeStates: ['urus-pengguna'],
  },
  {
    id: 'manual-pengguna',
    label: 'Manual Pengguna',
    icon: BookIcon,
    path: 'manual-pengguna',
    activeStates: ['manual-pengguna'],
  },
]

export default function SidebarMyds({ mobileSidebar, onclick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('PUBLIC')

  const location = useLocation()
  const navigate = useNavigate()
  const lang = localStorage.getItem('lang') ?? 'ms'

  // Load user role once on component mount
  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    const role = authData?.state?.user?.role as UserRole
    // Use PUBLIC as fallback if role is not found or invalid
    setUserRole(USER_ROLES.includes(role) ? role : 'PUBLIC')
  }, [])

  const getItemClasses = (active: boolean) => {
    if (active) {
      return 'bg-rdmkd-primary-100 text-rdmkd-primary-600 font-medium'
    }
    return 'text-txt-black-900 hover:bg-otl-gray-100'
  }

  const isMenuItemVisible = (item: Omit<MenuItem, 'roles'>) => {
    return ROLE_PERMISSIONS[String(userRole) as UserRole]?.includes(item.id) ?? false
  }

  const isMenuItemActive = (item: Omit<MenuItem, 'roles'>) => {
    const pathName = location.pathname
    // Highlight 'paparan-utama' only for exact '/en' or '/ms'
    if (
      (pathName === '/ms' || pathName === '/ms/' || pathName === '/en' || pathName === '/en/') &&
      item.id === 'paparan-utama'
    ) {
      return true
    }
    // For other menu items, highlight if path includes their activeStates
    if (item.id !== 'paparan-utama') {
      return item.activeStates.some((state) => pathName.includes(state))
    }
    return false
  }

  const handleMenuClick = (item: Omit<MenuItem, 'roles'>) => {
    const path = item.path ? `/${lang}/${item.path}` : `/${lang}`
    navigate(path)
    onclick?.()
  }

  const renderMenuItem = (item: Omit<MenuItem, 'roles'>) => {
    const IconComponent = item.icon

    return (
      <div
        key={item.id}
        className={`cursor-pointer flex items-center py-2 rounded-lg m-2 ${
          isCollapsed ? 'justify-center' : 'gap-2 pl-4'
        } ${getItemClasses(isMenuItemActive(item))}`}
        onClick={() => handleMenuClick(item)}
      >
        <IconComponent className="size-6" />
        {!isCollapsed && <span>{item.label}</span>}
      </div>
    )
  }

  return (
    <aside
      className={` ${
        mobileSidebar
          ? ''
          : 'hidden md:flex h-[calc(100vh-100px)] border border-otl-gray-300 border-t-0 border-b-0 flex-col transition-all duration-800 text-body-md font-body'
      }  
      ${isCollapsed ? 'w-[56px] border-l' : 'w-[230px] border-l-0'}`}
    >
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto pt-4 min-h-0">
        {menuItems.filter((item) => isMenuItemVisible(item)).map((item) => renderMenuItem(item))}
      </div>

      <div
        className={`flex items-center cursor-pointer p-2 pb-8 mt-auto flex-shrink-0 ${isCollapsed ? 'justify-center' : 'gap-2 pl-4'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {!mobileSidebar && (
          <>
            {isCollapsed ? (
              <ArrowForwardIcon className="transition-transform" />
            ) : (
              <ArrowBackIcon className="transition-transform" />
            )}
            {!isCollapsed && <span>Sembunyi</span>}
          </>
        )}
      </div>
    </aside>
  )
}
