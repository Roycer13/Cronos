import * as React from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    error?: string;
    disabled?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    className?: string;
}

export default function MultiSelect({
    label,
    value,
    onChange,
    placeholder = "Seleccionar...",
    options,
    error,
    disabled = false,
    searchable = true,
    clearable = true,
    className,
}: MultiSelectProps) {

    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [expanded, setExpanded] = React.useState(false);

    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(o =>
            o.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOptions = React.useMemo(() => {
        return options.filter(o => value.includes(o.value));
    }, [options, value]);

    // Foco automático al abrir
    React.useEffect(() => {
        if (open && searchable && !disabled) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [open, searchable, disabled]);

    // Cerrar al tocar fuera
    React.useEffect(() => {
        if (!open) return;
        const handler = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setSearchTerm("");
                setExpanded(false);
            }
        };
        document.addEventListener("pointerdown", handler);
        return () => document.removeEventListener("pointerdown", handler);
    }, [open]);

    const handleSelect = (v: string) => {
        if (disabled) return;
        const newValue = value.includes(v)
            ? value.filter(item => item !== v)
            : [...value, v];
        onChange(newValue);
        setSearchTerm("");
    };

    const handleRemove = (v: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        const newValue = value.filter(item => item !== v);
        onChange(newValue);
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange([]);
        setSearchTerm("");
        setExpanded(false);
        requestAnimationFrame(() => {
            setOpen(true);
            inputRef.current?.focus();
        });
    };

    const MAX_VISIBLE_BADGES = 2;

    return (
        <div ref={rootRef} className={className} onPointerDown={(e) => e.stopPropagation()}>
            <label className="text-sm font-medium">
                {label}
            </label>

            <div className="relative group mt-1">
                {/* Trigger */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        setOpen(o => !o);
                        if (open) setExpanded(false);
                    }}
                    className={cn(
                        "w-full flex items-start justify-between rounded-md border px-3 py-2 text-sm bg-background text-left min-h-10",
                        disabled && "opacity-50 cursor-not-allowed",
                        error && "border-red-500"
                    )}
                >
                    <div className="flex-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            <div className="space-y-1.5">
                                {/* Badges visibles */}
                                <div className="flex flex-wrap gap-1">
                                    {(expanded ? selectedOptions : selectedOptions.slice(0, MAX_VISIBLE_BADGES)).map(opt => (
                                        <Badge key={opt.value} variant="secondary" className="gap-1 pr-1">
                                            <span className="max-w-[120px] truncate">{opt.label}</span>
                                            {!disabled && (
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-red-500 flex-shrink-0"
                                                    onClick={(e) => handleRemove(opt.value, e)}
                                                />
                                            )}
                                        </Badge>
                                    ))}
                                    
                                    {/* Botón "ver más/menos" */}
                                    {selectedOptions.length > MAX_VISIBLE_BADGES && !expanded && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpanded(true);
                                            }}
                                            className="text-xs text-primary hover:underline px-1"
                                        >
                                            +{selectedOptions.length - MAX_VISIBLE_BADGES} más
                                        </button>
                                    )}
                                    
                                    {expanded && selectedOptions.length > MAX_VISIBLE_BADGES && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpanded(false);
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground px-1 flex items-center gap-0.5"
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                            Mostrar menos
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2 mt-0.5" />
                </button>

                {/* Botón limpiar todo */}
                {clearable && value.length > 0 && !disabled && (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded p-0.5 z-10"
                        title="Limpiar selección"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                )}

                {/* Dropdown */}
                {open && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
                        {searchable && (
                            <div className="p-2 border-b">
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            e.stopPropagation();
                                            if (e.key === "Enter") e.preventDefault();
                                        }}
                                        className="h-8 w-full rounded-md border px-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearchTerm("");
                                                requestAnimationFrame(() => inputRef.current?.focus());
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted rounded p-0.5"
                                        >
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                                    No se encontraron resultados
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50",
                                            value.includes(option.value) && "bg-muted/50 font-medium"
                                        )}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value.includes(option.value) && (
                                            <div className="h-3 w-3 rounded-sm bg-primary flex-shrink-0 ml-2" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <span className="text-xs text-red-500 mt-1 block">{error}</span>
                )}
            </div>
        </div>
    );
}