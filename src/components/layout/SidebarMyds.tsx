import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronDownIcon,
  DocumentFilledIcon,
  DocumentIcon,
  FolderIcon,
  GridIcon,
  HeartIcon,
  QuestionCircleIcon,
  SearchIcon,
  SettingIcon,
  UploadIcon,
  UserGroupIcon,
  UserIcon,
} from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_PERMISSIONS, resolveUserRoles, type UserRole } from '../../models/userRoles'
import { renderInProgressTag } from '@/utils/RenderTag'

interface SidebarProps {
  onclick?: () => void
}

interface SubMenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  inProgress?: boolean
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  activeStates: string[]
  roles: string[]
  inProgress?: boolean
  children?: SubMenuItem[]
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
    label: 'Carian Kandungan',
    icon: SearchIcon,
    path: 'carian-kandungan',
    activeStates: ['carian-kandungan'],
  },
  {
    id: 'kegemaran',
    label: 'Kegemaran',
    icon: HeartIcon,
    path: 'kegemaran',
    activeStates: ['kegemaran'],
    inProgress: true,
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
        icon: DocumentIcon,
        path: 'pengurusan-dokumen',
      },
      {
        id: 'pengurusan-pengguna',
        label: 'Pengurusan Pengguna',
        icon: UserGroupIcon,
        path: 'pengurusan-pengguna',
      },
      {
        id: 'pengurusan-profil',
        label: 'Pengurusan Profil',
        icon: UserIcon,
        path: 'pengurusan-profil',
      },
    ],
  },
  {
    id: 'log-aktiviti',
    label: 'Log Aktiviti',
    icon: DocumentFilledIcon,
    path: 'log-aktiviti',
    activeStates: ['log-aktiviti'],
    inProgress: true,
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

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

  // Keep only the group whose sub-page is the active route expanded, and
  // collapse every other group whenever the route changes (e.g. navigating
  // to an unrelated page). Manual toggling via toggleGroup is unaffected
  // since it doesn't change the route.
  useEffect(() => {
    const activeGroup = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.includes(child.path))
    )

    setExpandedGroups(activeGroup ? [activeGroup.id] : [])
  }, [location.pathname])

  const hasPermission = (permissionId: string) =>
    userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permissionId) ?? false)

  const isMenuItemVisible = (item: Omit<MenuItem, 'roles'>) => {
    // Groups are permission-less containers; they're visible if the user
    // has access to at least one of their sub-pages.
    if (item.children?.length) {
      return item.children.some((child) => hasPermission(child.id))
    }

    // Check if ANY of the user's roles grants access to this menu item
    return hasPermission(item.id)
  }

  const isSubMenuItemVisible = (subItem: SubMenuItem) => hasPermission(subItem.id)

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

  const isSubMenuItemActive = (subItem: SubMenuItem) => {
    return location.pathname.includes(subItem.path)
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]
    )
  }

  const handleMenuClick = (item: Omit<MenuItem, 'roles'>) => {
    // Groups toggle open/closed instead of navigating, unless the sidebar is
    // collapsed to icons only, in which case there is no room to show
    // sub-items so we jump straight to the group's default sub-page.
    if (item.children?.length) {
      if (isCollapsed) {
        const firstVisibleChild = item.children.find((child) => isSubMenuItemVisible(child))
        navigate(`/${lang}/${firstVisibleChild?.path ?? item.path}`)
        onclick?.()
        return
      }
      toggleGroup(item.id)
      return
    }

    const path = item.path ? `/${lang}/${item.path}` : `/${lang}`
    navigate(path)
    onclick?.()
  }

  const handleSubMenuClick = (subItem: SubMenuItem) => {
    navigate(`/${lang}/${subItem.path}`)
    onclick?.()
  }

  const renderMenuItem = (item: Omit<MenuItem, 'roles'>) => {
    const IconComponent = item.icon
    const hasChildren = !!item.children?.length
    const isExpanded = hasChildren && expandedGroups.includes(item.id)

    return (
      <div key={item.id}>
        <div
          className={clx(
            'cursor-pointer flex items-center py-2 pl-4 rounded-lg',
            !isCollapsed && 'mr-6',
            isMenuItemActive(item)
              ? 'bg-primary-100 text-primary-600 font-medium'
              : 'text-txt-black-900 hover:bg-otl-gray-100'
          )}
          onClick={() => handleMenuClick(item)}
        >
          <IconComponent className="size-5 flex-shrink-0" />
          <span
            className={`flex min-w-0 flex-1 justify-between items-center gap-2 transition-opacity duration-300 overflow-hidden ${
              isCollapsed ? 'w-0 opacity-0 ml-0' : 'opacity-100 ml-2'
            }`}
          >
            <span className="truncate">{item.label}</span>
            {item.inProgress && renderInProgressTag()}
            {hasChildren && !isCollapsed && (
              <div className="pr-2">
                <ChevronDownIcon
                  className={clx(
                    'size-4 flex-shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </div>
            )}
          </span>
        </div>

        {hasChildren && !isCollapsed && (
          <div
            className={clx(
              'grid transition-all duration-300 ease-in-out',
              isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="flex flex-col overflow-hidden">
              {item.children!.filter(isSubMenuItemVisible).map((subItem) => {
                const active = isSubMenuItemActive(subItem)

                return (
                  <div
                    key={subItem.id}
                    className={clx(
                      'relative cursor-pointer flex items-center py-2 pl-8 mr-6 rounded-lg',
                      'after:absolute after:left-8 after:right-0 after:bottom-0 after:border-b after:border-otl-divider',
                      active
                        ? 'text-primary-600 font-medium'
                        : 'text-txt-black-900 hover:bg-otl-gray-100'
                    )}
                    onClick={() => handleSubMenuClick(subItem)}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 ml-3">
                      <span className="truncate">{subItem.label}</span>
                      {subItem.inProgress && renderInProgressTag()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`flex flex-col transition-all duration-300 text-body-sm font-normal font-body lg:h-full lg:border lg:border-otl-gray-300 lg:border-t-0 lg:border-b-0 ${
        isCollapsed ? 'lg:w-[56px] lg:border-l' : 'lg:w-[230px] lg:border-l-0'
      }`}
    >
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto pt-6 min-h-0">
        {menuItems
          .filter((item) => isMenuItemVisible(item))
          .slice(0, 4)
          .map((item) => renderMenuItem(item))}

        <div
          className={`border-b border-otl-divider pt-3 mr-6 mb-3 flex items-center justify-center`}
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
