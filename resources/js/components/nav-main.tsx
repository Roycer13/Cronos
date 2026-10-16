"use client"

import * as React from "react"
import { useAuth } from '@/hooks/useAuth';
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { type NavItem } from "@/types"
import { Link, usePage } from "@inertiajs/react"


export function NavMain({ items }: { items: NavItem[] }) {
  const page = usePage()
  const { open: sidebarOpen } = useSidebar()
  const [openItem, setOpenItem] = React.useState<string | null>(null)

  const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

  // Función auxiliar segura para obtener href
  const getHref = (href: any): string => {
    if (typeof href === "string") return href
    if (typeof href === "object" && "url" in href) return href.url
    return "#"
  }

  // Cargar menú abierto desde localStorage al iniciar
  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-open-item")
    if (saved) setOpenItem(saved)
  }, [])

  // Guardar cambios de menú abierto
  React.useEffect(() => {
    if (openItem) {
      localStorage.setItem("sidebar-open-item", openItem)
    } else {
      localStorage.removeItem("sidebar-open-item")
    }
  }, [openItem])

  // Detectar automáticamente submenú activo
  React.useEffect(() => {
    const activeParent = items.find((item) =>
      item.items?.some((sub) => page.url.startsWith(getHref(sub.href)))
    )
    if (activeParent) {
      setOpenItem(activeParent.title)
      localStorage.setItem("sidebar-open-item", activeParent.title)
    }
  }, [page.url, items])

  const toggleItem = (title: string) => {
    setOpenItem((prev) => (prev === title ? null : title))
  }

  return (
    <SidebarGroup>
       <Link href={route('dashboardPlanta.index')}>


    {hasPermission('r_dashboardPlanta') && (
  <SidebarGroupLabel>PLANTA LÁCTEOS</SidebarGroupLabel>
 )}

</Link>
      <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const hasLongTitle = item.title.length > 24
          const itemHref = getHref(item.href)
          const isActive =
            page.url === itemHref || page.url.startsWith(`${itemHref}/`)
          const isOpen = openItem === item.title

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen && sidebarOpen} // 🔥 ahora se oculta visualmente, pero no borra el estado
              onOpenChange={() => toggleItem(item.title)}
            >
              <SidebarMenuItem>
                {hasChildren ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`transition-colors ${
                        isActive ? "bg-muted text-foreground font-medium" : ""
                      } ${hasLongTitle ? "!h-auto min-h-8 py-2 [&>span:last-child]:!overflow-visible [&>span:last-child]:!text-clip [&>span:last-child]:!whitespace-normal" : ""}`}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto size-4 transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <Link href={itemHref} prefetch>
                    <SidebarMenuButton
                      className={`transition-colors ${
                        isActive ? "bg-muted text-foreground font-medium" : ""
                      } ${hasLongTitle ? "!h-auto min-h-8 py-2 [&>span:last-child]:!overflow-visible [&>span:last-child]:!text-clip [&>span:last-child]:!whitespace-normal" : ""}`}
                    >
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}

                {hasChildren && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((sub) => {
                        const subHref = getHref(sub.href)
                        const hasLongSubTitle = sub.title.length > 24
                        const isSubActive =
                          page.url === subHref ||
                          page.url.startsWith(`${subHref}/`)
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={subHref}
                                prefetch
                                className={`transition-colors ${
                                  isSubActive
                                    ? "bg-muted text-foreground font-medium"
                                    : ""
                                } ${hasLongSubTitle ? "!h-auto min-h-7 py-1.5 [&>span:last-child]:!overflow-visible [&>span:last-child]:!text-clip [&>span:last-child]:!whitespace-normal" : ""}`}
                              >
                                <span>{sub.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
