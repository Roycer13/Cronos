import { useCallback } from 'react';

export function useInitials() {
    return useCallback((fullName: string | null | undefined): string => {
        // Verificar si es null, undefined o string vacío
        if (!fullName || typeof fullName !== 'string') {
            return '';
        }

        // Limpiar espacios y dividir
        const names = fullName.trim().split(' ').filter(name => name.length > 0);

        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        // Para nombres con 2 partes -> 2 iniciales (Ej: Juan Perez -> JP)
        if (names.length === 2) {
            return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
        }

        // Para 3 partes -> 3 iniciales (Ej: Juan Carlos Perez -> JCP)
        if (names.length === 3) {
            return `${names[0].charAt(0)}${names[1].charAt(0)}${names[2].charAt(0)}`.toUpperCase();
        }

        // Para 4 o más partes, tomar las 4 más representativas: primeros dos y últimos dos (Ej: Juan Carlos Perez Gomez -> JCPG)
        const firstTwo = names.slice(0, 2).map(n => n.charAt(0));
        const lastTwo = names.slice(-2).map(n => n.charAt(0));
        return [...firstTwo, ...lastTwo].join('').toUpperCase();
    }, []);
}
