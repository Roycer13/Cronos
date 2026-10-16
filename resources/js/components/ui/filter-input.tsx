import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterInputProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
}

export default function FilterInput({
    value,
    onChange,
    placeholder,
    className,
}: FilterInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        inputRef.current?.focus();
    };

    return (
        <div
            className={cn(
                "relative flex items-center",
                className
            )}
        >
            <input
                ref={inputRef}
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    value && "pr-8"
                )}
            />

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2 flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                >
                    <X className="h-3 w-3 text-muted-foreground" />
                </button>
            )}
        </div>
    );
}
