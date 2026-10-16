import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    error?: string;
    disabled?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    className?: string;
    required?: boolean;
}

export default function FormSelect({
    label,
    value,
    onChange,
    placeholder = "Select an option",
    options,
    error,
    disabled = false,
    searchable = true,
    clearable = true,
    className,
    required = false,
}: FormSelectProps) {

    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options;

        return options.filter(o =>
            o.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOption = React.useMemo(() => {
        return options.find(o => o.value === value);
    }, [options, value]);

    // foco automático al abrir
    React.useEffect(() => {
        if (open && searchable && !disabled) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [open, searchable, disabled]);

    // cerrar al tocar fuera
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
        if (disabled) return;

        onChange(v);
        setSearchTerm("");

        // cerrar el select después de seleccionar
        requestAnimationFrame(() => {
            setOpen(false);
        });
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        onChange("");
        setSearchTerm("");

        requestAnimationFrame(() => {
            setOpen(true);
            inputRef.current?.focus();
        });
    };

    return (
        <div ref={rootRef} className={className} onPointerDown={(e) => e.stopPropagation()}>
            <label className="text-sm font-medium">
                {label}{required && <span className="ml-1 text-destructive">*</span>}
            </label>

            <div className="relative group mt-1">
                {/* Trigger */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        setOpen(o => !o);
                    }}
                    className={cn(
                        "w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-background text-left",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span className="whitespace-normal">
                        {selectedOption?.label || placeholder}
                    </span>
                </button>

                {clearable && value && value !== "" && !disabled && (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded p-0.5"
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
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onPointerDown={(e) =>
                                            e.stopPropagation()
                                        }
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
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
                                            value === option.value &&
                                                "bg-muted/50"
                                        )}
                                    >
                                        <span className="whitespace-normal">
                                            {option.label}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <span className="text-red-500 text-sm">
                    {error}
                </span>
            )}
        </div>
    );
}
