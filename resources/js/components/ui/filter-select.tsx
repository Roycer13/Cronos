import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    includeAllOption?: boolean;
    allLabel?: string;
    searchable?: boolean;
    className?: string;
    triggerClassName?: string;
}

export default function FilterSelect({
    value,
    onChange,
    placeholder,
    options,
    includeAllOption = true,
    allLabel,
    searchable = true,
    className,
    triggerClassName,
}: FilterSelectProps) {

    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const allOption = React.useMemo(
        () => ({ value: "all", label: allLabel || placeholder }),
        [allLabel, placeholder]
    );

    const baseOptions = React.useMemo(() => {
        return includeAllOption
            ? [allOption, ...options]
            : options;
    }, [includeAllOption, options, allOption]);

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return baseOptions;

        return baseOptions.filter(o =>
            o.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [baseOptions, searchTerm]);

    const selected =
        baseOptions.find(o => o.value === (value ?? "all")) ?? allOption;

    // foco automático al abrir
    React.useEffect(() => {
        if (open && searchable) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [open, searchable]);

    // cerrar al click fuera
    React.useEffect(() => {
        if (!open) return;

        const handler = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("pointerdown", handler);

        return () => document.removeEventListener("pointerdown", handler);
    }, [open]);

    const handleSelect = (v: string) => {
        onChange(v);
        setSearchTerm("");

        // cerrar el select después de seleccionar
        requestAnimationFrame(() => {
            setOpen(false);
        });
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();

        onChange("all");
        setSearchTerm("");

        requestAnimationFrame(() => {
            setOpen(true);
            inputRef.current?.focus();
        });
    };

    return (
        <div
            ref={rootRef}
            className={cn("relative inline-block", className)}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "relative group flex items-center justify-between min-w-[140px] border rounded-md px-3 py-2 text-sm bg-background",
                    triggerClassName
                )}
            >
                <span className="truncate">
                    {selected?.label || placeholder}
                </span>

                {value && value !== "all" && (
                    <span
                        onClick={clearSelection}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded p-0.5"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute z-50 mt-1 min-w-[200px] rounded-md border bg-popover shadow-md overflow-hidden"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {searchable && (
                        <div className="p-2 border-b">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={searchTerm}
                                    placeholder={`Buscar ${placeholder.toLowerCase()}...`}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="h-8 w-full rounded-md border px-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchTerm("");
                                            requestAnimationFrame(() => {
                                                inputRef.current?.focus();
                                            });
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted rounded p-0.5"
                                    >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="max-h-[200px] overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                                No se encontraron resultados
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        handleSelect(option.value)
                                    }
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50",
                                        (value ?? "all") === option.value &&
                                            "bg-muted/50"
                                    )}
                                >
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
