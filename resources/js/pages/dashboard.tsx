import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div> */}

                <div className="relative min-h-[350px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-900/40 dark:to-blue-950/30 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-slate-300/30 dark:stroke-slate-700/20" />

                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="max-w-md text-center">
                            <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-md dark:from-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700/50 mb-6">
                                <div className="text-3xl">🥛</div>
                                <div className="absolute -top-2 -right-2 text-xl">🔧</div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                                Dashboard en Desarrollo
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                                Estamos trabajando en el sistema de producción láctea
                            </p>

                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
                                <span className="flex size-2 rounded-full bg-amber-500"></span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Próximamente disponible
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
