import {
  ArrowBackIcon,
  ArrowForwardIcon,
  DocumentFilledIcon,
  FolderIcon,
  GridIcon,
  HeartIcon,
  QuestionCircleIcon,
  SearchIcon,
  SettingIcon,
  UploadIcon,
} from '@govtechmy/myds-react/icon'
import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_PERMISSIONS, resolveUserRoles, type UserRole } from '../../models/userRoles'

interface SidebarProps {
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
    id: 'katalog-dokumen',
    label: 'Katalog Dokumen',
    icon: FolderIcon,
    path: 'katalog-dokumen',
    activeStates: ['katalog-dokumen'],
  },
  {
    id: 'muatnaik-dokumen',
    label: 'Muat Naik Dokumen',
    icon: UploadIcon,
    path: 'muatnaik-dokumen',
    activeStates: ['muatnaik-dokumen'],
  },
  {
    id: 'carian-dokumen',
    label: 'Carian Dokumen',
    icon: SearchIcon,
    path: 'carian-dokumen',
    activeStates: ['carian-dokumen'],
  },
  {
    id: 'kegemaran',
    label: 'Kegemaran',
    icon: HeartIcon,
    path: 'kegemaran',
    activeStates: ['kegemaran'],
  },
  {
    id: 'pengurusan',
    label: 'Pengurusan',
    icon: SettingIcon,
    path: 'pengurusan',
    activeStates: ['pengurusan'],
  },
  {
    id: 'log-aktiviti',
    label: 'Log Aktiviti',
    icon: DocumentFilledIcon,
    path: 'log-aktiviti',
    activeStates: ['log-aktiviti'],
  },
  {
    id: 'bantuan',
    label: 'Bantuan',
    icon: QuestionCircleIcon,
    path: 'bantuan',
    activeStates: ['bantuan'],
  },
]

export default function SidebarMyds({ onclick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRoles, setUserRoles] = useState<UserRole[]>(['PUBLIC'])

  const location = useLocation()
  const navigate = useNavigate()
  const lang = localStorage.getItem('lang') ?? 'ms'

  // Load user roles once on component mount
  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    const roles = (authData?.state?.user?.roles || []) as string[]

    // Any unknown role falls back to PUBLIC permissions.
    setUserRoles(resolveUserRoles(roles))
  }, [])

  const getItemClasses = (active: boolean) => {
    if (active) {
      return 'bg-primary-100 text-primary-600 font-medium'
    }
    return 'text-txt-black-900 hover:bg-otl-gray-100'
  }

  const isMenuItemVisible = (item: Omit<MenuItem, 'roles'>) => {
    // Check if ANY of the user's roles grants access to this menu item
    return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(item.id) ?? false)
  }

  const isMenuItemActive = (item: Omit<MenuItem, 'roles'>) => {
    const pathName = location.pathname
    const normalizedPath =
      pathName.endsWith('/') && pathName.length > 1 ? pathName.slice(0, -1) : pathName

    // Highlight 'paparan-utama' for the base homepage path and specific special paths.
    if (
      item.id === 'paparan-utama' &&
      [
        '/ms',
        '/en',
        '/ms/perlu-kelulusan',
        '/en/perlu-kelulusan',
        '/ms/tidak-lulus',
        '/en/tidak-lulus',
        '/ms/draf',
        '/en/draf',
        '/ms/diluluskan',
        '/en/diluluskan',
      ].includes(normalizedPath)
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
        className={`cursor-pointer flex items-center py-2 pl-4 rounded-lg ${
          isCollapsed ? '' : 'mr-6'
        } ${getItemClasses(isMenuItemActive(item))}`}
        onClick={() => handleMenuClick(item)}
      >
        <IconComponent className="size-5 flex-shrink-0" />
        <span
          className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden ${
            isCollapsed ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-2'
          }`}
        >
          {item.label}
        </span>
      </div>
    )
  }

  return (
    <aside
      className={`flex flex-col transition-all duration-300 text-body-sm font-normal font-body lg:h-[calc(100vh-100px)] lg:border lg:border-otl-gray-300 lg:border-t-0 lg:border-b-0 ${
        isCollapsed ? 'lg:w-[56px] lg:border-l' : 'lg:w-[230px] lg:border-l-0'
      }`}
    >
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto pt-6 min-h-0">
        {menuItems
          .filter((item) => isMenuItemVisible(item))
          .slice(0, 4)
          .map((item) => renderMenuItem(item))}

        <div
          className={`border-b border-otl-divider pt-3 mb-3 w-9/12 mx-auto flex items-center justify-center`}
        ></div>

        {menuItems
          .filter((item) => isMenuItemVisible(item))
          .slice(4)
          .map((item) => renderMenuItem(item))}
      </div>

      <div
        className="hidden lg:flex items-center cursor-pointer p-2 pl-4 pb-8 mt-auto flex-shrink-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? (
          <ArrowForwardIcon className="flex-shrink-0" />
        ) : (
          <ArrowBackIcon className="flex-shrink-0" />
        )}
        <span
          className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden ${
            isCollapsed ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-2'
          }`}
        >
          Sembunyi
        </span>
      </div>
    </aside>
  )
}
