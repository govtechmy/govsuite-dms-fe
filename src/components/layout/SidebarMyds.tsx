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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@govtechmy/myds-react/accordion'
import { clx } from '@govtechmy/myds-react/utils'
import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_PERMISSIONS, USER_ROLES, type UserRole } from '../../models/userRoles'

interface SidebarProps {
  onclick?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  activeStates: string[]
  matchExact?: boolean
  roles: string[]
  children?: Omit<MenuItem, 'roles' | 'children'>[]
}

const menuItems: Omit<MenuItem, 'roles'>[] = [
  {
    id: 'paparan-utama',
    label: 'Paparan Utama',
    icon: GridIcon,
    path: '',
    activeStates: ['', 'perlu-kelulusan', 'tidak-lulus', 'draf'],
    matchExact: true,
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
    path: 'pengurusan-dokumen',
    activeStates: ['pengurusan-dokumen', 'pengurusan-pengguna', 'pengurusan-profil'],
    children: [
      {
        id: 'pengurusan-dokumen',
        label: 'Pengurusan Dokumen',
        icon: SettingIcon,
        path: 'pengurusan-dokumen',
        activeStates: ['pengurusan-dokumen'],
      },
      {
        id: 'pengurusan-pengguna',
        label: 'Pengurusan Pengguna',
        icon: SettingIcon,
        path: 'pengurusan-pengguna',
        activeStates: ['pengurusan-pengguna'],
      },
      {
        id: 'pengurusan-profil',
        label: 'Pengurusan Profil',
        icon: SettingIcon,
        path: 'pengurusan-profil',
        activeStates: ['pengurusan-profil'],
      },
    ],
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
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const location = useLocation()
  const navigate = useNavigate()
  const lang = localStorage.getItem('lang') ?? 'ms'

  // Load user roles once on component mount
  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    const roles = (authData?.state?.user?.roles || []) as string[]
    const validRoles = roles.filter((role): role is UserRole =>
      USER_ROLES.includes(role as UserRole)
    )
    // Use PUBLIC as fallback if no valid roles found
    setUserRoles(validRoles.length > 0 ? validRoles : ['PUBLIC'])
  }, [])

  // Auto-expand parent menu items when their child routes are active
  useEffect(() => {
    const pathName = location.pathname
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.activeStates.some((state) => pathName.includes(state))
        if (isChildActive && !expandedItems.includes(item.id)) {
          setExpandedItems((prev) => [...prev, item.id])
        }
      }
    })
  }, [location.pathname])

  const getItemClasses = (active: boolean) => {
    return clx(
      'text-txt-black-900',
      active ? 'bg-primary-100 text-primary-600 font-medium' : 'hover:bg-otl-gray-100'
    )
  }

  const isMenuItemVisible = (item: Omit<MenuItem, 'roles'>) => {
    // Check if ANY of the user's roles grants access to this menu item
    return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(item.id) ?? false)
  }

  const isMenuItemActive = (item: Omit<MenuItem, 'roles'>) => {
    const pathName = location.pathname
    const normalizedPath =
      pathName.endsWith('/') && pathName.length > 1 ? pathName.slice(0, -1) : pathName

    // Extract route part after language prefix (/:lang/...)
    const routePart = normalizedPath.split('/').slice(2).join('/')

    if (item.matchExact) {
      // Exact matching for base paths and specific routes
      return item.activeStates.some((state) =>
        state === '' ? routePart === '' : routePart === state
      )
    }

    // Substring matching for other items
    return item.activeStates.some((state) => pathName.includes(state))
  }

  const handleMenuClick = (item: Omit<MenuItem, 'roles'>) => {
    // If item has children, only toggle accordion (no navigation)
    if (item.children) {
      // Toggle: if already expanded, remove it; otherwise add it
      setExpandedItems((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      )
    } else {
      const path = item.path ? `/${lang}/${item.path}` : `/${lang}`
      navigate(path)
    }
    onclick?.()
  }

  const renderMenuItem = (item: Omit<MenuItem, 'roles'>) => {
    const IconComponent = item.icon
    const hasChildren = item.children && item.children.length > 0

    // If item has children, use Accordion component
    if (hasChildren && !isCollapsed) {
      return (
        <Accordion
          key={item.id}
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
        >
          <AccordionItem value={item.id} className="border-none">
            <AccordionTrigger
              className={`cursor-pointer flex items-center py-2 pl-4 pr-2 rounded-lg mr-6 hover:no-underline data-[state=open]:no-underline ${getItemClasses(
                isMenuItemActive(item)
              )}`}
              onClick={(e) => {
                e.preventDefault()
                handleMenuClick(item)
              }}
            >
              <div className="flex items-center flex-1">
                <IconComponent className="size-5 flex-shrink-0" />
                <span className="whitespace-nowrap ml-2 font-body text-body-sm font-normal">
                  {item.label}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pr-6 ">
              <div className="mt-1">
                {item.children!.map((child) => {
                  return (
                    <div
                      key={child.id}
                      className={`cursor-pointer flex items-center py-2 rounded-lg ml-7 ${getItemClasses(
                        isMenuItemActive(child)
                      )}`}
                      onClick={() => {
                        const path = child.path ? `/${lang}/${child.path}` : `/${lang}`
                        navigate(path)
                        onclick?.()
                      }}
                    >
                      <span className="whitespace-nowrap pl-4 font-body font-normal text-body-sm">
                        {child.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    // Regular menu item (no children or collapsed sidebar)
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
          className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden font-body font-normal text-body-sm ${
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
          className={`whitespace-nowrap transition-opacity duration-300 overflow-hidden font-body font-normal text-body-sm ${
            isCollapsed ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-2'
          }`}
        >
          Sembunyi
        </span>
      </div>
    </aside>
  )
}
