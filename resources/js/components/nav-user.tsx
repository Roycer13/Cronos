import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Phone } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                data-test="sidebar-menu-button"
                            >
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={
                                isMobile
                                    ? 'bottom'
                                    : state === 'collapsed'
                                      ? 'left'
                                      : 'bottom'
                            }
                        >
                            <UserMenuContent 
                                user={auth.user} 
                                onOpenContact={() => setIsContactOpen(true)}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contacto de Soporte</DialogTitle>
                        <DialogDescription>
                            Comunícate con cualquiera de los siguientes números para recibir asistencia.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 py-4">
                        <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <Phone className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Corporativo</p>
                                <p className="text-sm text-muted-foreground">69960519</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <Phone className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Whatsapp</p>
                                <p className="text-sm text-muted-foreground">71560644</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <Phone className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium">Whatsapp</p>
                                <p className="text-sm text-muted-foreground">67096174</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
