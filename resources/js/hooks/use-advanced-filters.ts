// hooks/use-advanced-filters.ts
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

interface UseAdvancedFiltersProps<T extends Record<string, any>> {
    routeName: string;
    initialFilters: T;
    debounceFields?: (keyof T)[];
    debounceDelay?: number;
}

export const useAdvancedFilters = <T extends Record<string, any>>({
    routeName,
    initialFilters,
    debounceFields = [],
    debounceDelay = 500,
}: UseAdvancedFiltersProps<T>) => {
    const [filters, setFilters] = useState<T>(initialFilters);
    const firstRender = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const prevFilters = useRef<T>(initialFilters);

    const applyFilters = useCallback(
        (newFilters: T, resetPage = true) => {
            const payload = resetPage ? { ...newFilters, page: 1 } : newFilters;

            router.get(route(routeName), payload, {
                preserveState: true,
                replace: true,
            });
            prevFilters.current = newFilters;
        },
        [routeName],
    );

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const needsDebounce = debounceFields.some(
            (field) => filters[field] !== prevFilters.current[field],
        );

        if (needsDebounce) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                applyFilters(filters);
            }, debounceDelay);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [filters, debounceFields, debounceDelay, applyFilters]);

    const updateFilter = (key: string, value: any) => {
        // 🔹 Si es 'all' o cadena vacía, lo dejamos como undefined
        const filterValue = value === 'all' || value === '' ? undefined : value;

        const newFilters = { ...filters, [key]: filterValue };
        setFilters(newFilters);

        // Actualización inmediata para campos no debounce
        if (!debounceFields.includes(key)) {
            applyFilters(newFilters);
        }
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        applyFilters(initialFilters);
    };

    return {
        filters,
        updateFilter,
        resetFilters,
        setFilters,
    };
};
