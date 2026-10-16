// resources/js/components/AppSidebar.tsx
import { useState, useEffect, useMemo } from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ubicacionesData, type Area } from "@/data/areas-data"
import { usePage } from "@inertiajs/react"
import { type NavItem } from "@/types"

export function AppSidebar() {
  const { auth } = usePage().props as any
  const { open } = useSidebar()

  const user = auth?.user || null
  const userRoles: string[] = user?.roles ?? []
  const userPermissions: string[] = user?.permissions ?? []

  // Filtrado recursivo de items por permisos
  const filterItemsByPermission = (items: NavItem[] | undefined): NavItem[] => {
    if (!items) return []

    return items
      .map(item => {
        const newItems = item.items ? filterItemsByPermission(item.items) : undefined
        return { ...item, items: newItems }
      })
      .filter(item => {
        if (
          item.roles &&
          !userRoles.includes('admin') &&
          !item.roles.some(role => userRoles.includes(role))
        ) {
          return false
        }

        if (item.permission) {
          if (userRoles.includes('admin')) return true
          return userPermissions.includes(item.permission)
        }
        if (item.items && Array.isArray(item.items)) {
          return item.items.length > 0
        }
        return true
      })
  }

  // Obtener ubicaciones disponibles según el usuario
  const getAvailableUbicaciones = () => {
    if (!user) return []

    if (userRoles.includes('admin')) return ubicacionesData

    // Usuarios normales solo ven su propia ubicación
    return ubicacionesData.filter(u =>
      u.name.toLowerCase() === user?.ubicacion?.nombre?.toLowerCase()
    )
  }

  const availableUbicaciones = useMemo(
    () => getAvailableUbicaciones(),
    [userRoles.join(','), userPermissions.join(','), user?.ubicacion?.nombre]
  )

  const [selectedUbicacion, setSelectedUbicacion] = useState<Area | null>(
    availableUbicaciones[0] ?? null
  )

  // Efecto para cargar ubicación guardada o default del usuario
  useEffect(() => {
    if (availableUbicaciones.length > 0) {
      const savedName = localStorage.getItem('selected-ubicacion')
      const saved = availableUbicaciones.find(u => u.name === savedName)

      if (saved) {
        setSelectedUbicacion(saved)
      } else {
        const defaultUbicacion =
          availableUbicaciones.find(u => u.name.toLowerCase() === user?.ubicacion?.nombre?.toLowerCase()) ??
          availableUbicaciones[0]
        setSelectedUbicacion(defaultUbicacion)
        localStorage.setItem('selected-ubicacion', defaultUbicacion.name)
      }
    } else {
      setSelectedUbicacion(null)
    }
  }, [availableUbicaciones, user?.ubicacion?.nombre])

  useEffect(() => {
    if (selectedUbicacion) {
      localStorage.setItem('selected-ubicacion', selectedUbicacion.name)
    }
  }, [selectedUbicacion])

  if (availableUbicaciones.length === 0) {
    return (
      <Sidebar collapsible="icon" variant="inset">
        <SidebarContent>
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes acceso a ninguna ubicación
          </div>
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    )
  }

  const showSwitcher = availableUbicaciones.length > 1

  const SingleUbicacionDisplay = () => {
    const u = availableUbicaciones[0]
    const Logo = u.logo
    return (
      <div className="flex items-center gap-2 p-2 text-sm font-medium">
        <Logo className="h-5 w-5" />
        <span>{u.name}</span>
      </div>
    )
  }

  const roleNavMain = selectedUbicacion && !userRoles.includes('admin')
    ? userRoles.map(role => selectedUbicacion.navByRole?.[role]).find(Boolean)
    : undefined
  const itemsToRender = selectedUbicacion
    ? filterItemsByPermission(roleNavMain ?? selectedUbicacion.navMain)
    : []

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        {open && showSwitcher && selectedUbicacion && (
          <TeamSwitcher
            areas={availableUbicaciones}
            selectedArea={selectedUbicacion}
            onChange={(u) => setSelectedUbicacion(u)}
          />
        )}
        {open && !showSwitcher && <SingleUbicacionDisplay />}
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={itemsToRender} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
