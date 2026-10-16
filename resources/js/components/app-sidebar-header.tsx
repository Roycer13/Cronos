import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

function JulianCalculator() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [julianInput, setJulianInput] = useState('');
    const [dateInput, setDateInput] = useState('');

    const handleJulianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setJulianInput(val);
        const jDay = parseInt(val, 10);
        if (!isNaN(jDay) && jDay > 0 && jDay <= 366) {
            const date = new Date(year, 0, jDay);
            const yStr = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            setDateInput(`${yStr}-${m}-${d}`);
        } else {
            setDateInput('');
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateInput(val);
        if (val) {
            // Append time to avoid timezone offset shifting the day
            const date = new Date(val + 'T00:00:00');
            if (!isNaN(date.getTime())) {
                setYear(date.getFullYear());
                const start = new Date(date.getFullYear(), 0, 0);
                const diff =
                    date.getTime() -
                    start.getTime() +
                    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
                const oneDay = 1000 * 60 * 60 * 24;
                setJulianInput(String(Math.floor(diff / oneDay)));
            } else {
                setJulianInput('');
            }
        } else {
            setJulianInput('');
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const y = parseInt(e.target.value, 10);
        setYear(isNaN(y) ? new Date().getFullYear() : y);
        
        if (!isNaN(y)) {
            const jDay = parseInt(julianInput, 10);
            if (!isNaN(jDay) && jDay > 0 && jDay <= 366) {
                const date = new Date(y, 0, jDay);
                const yStr = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                setDateInput(`${yStr}-${m}-${d}`);
            }
        }
    };

    return (
        <div className="grid gap-4">
            <div className="space-y-1">
                <h4 className="font-medium leading-none">Calculadora Juliana</h4>
                <p className="text-sm text-muted-foreground">
                    Convierte entre día juliano y fecha.
                </p>
            </div>
            <div className="grid gap-2">
                <label htmlFor="year" className="text-xs font-medium">Año</label>
                <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={handleYearChange}
                    className="h-8"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label htmlFor="julian" className="text-xs font-medium">Día Juliano</label>
                    <Input
                        id="julian"
                        type="number"
                        min="1"
                        max="366"
                        value={julianInput}
                        onChange={handleJulianChange}
                        placeholder="Ej. 125"
                        className="h-8"
                    />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="date" className="text-xs font-medium">Fecha</label>
                    <Input
                        id="date"
                        type="date"
                        value={dateInput}
                        onChange={handleDateChange}
                        className="h-8"
                    />
                </div>
            </div>
        </div>
    );
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getJulianDay = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff =
            date.getTime() -
            start.getTime() +
            (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* Widget de Reloj y Juliano */}
            <div className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
                <div className="flex flex-col items-end">
                    <span className="font-medium text-foreground">
                        {formatTime(currentTime)}
                    </span>
                    <span className="text-xs">
                        {formatDate(currentTime)}
                    </span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="flex cursor-pointer flex-col items-center justify-center rounded-md bg-muted px-2 py-1 text-left outline-none transition-colors hover:bg-muted/80">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Día Juliano
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {getJulianDay(currentTime)}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <JulianCalculator />
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
