// types/canastillos.ts
export interface Almacen {
    id: number;
    nombre: string;
    ubicacion?: string;
    responsable_id?: number;
    responsable?: { name: string; apellido: string };
    tipo_almacen_id: number;
    tipo_almacen?: { id: number; nombre: string };
    observaciones?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Canastillo {
    id: number;
    nombre: string;
    alias?: string;
    tamaño?: string;
    precio?: number;
    color?: string;
    detalle?: string;
}

export interface Vendedor {
    id: number;
    nombre: string;
    apellido: string;
    codigo?: string;
    telefono?: string;
}

export interface Movimiento {
    id: number;
    almacen_id: number;
    almacen?: Almacen;
    almacen2_id?: number;
    almacen2?: Almacen;
    responsable_id: number;
    responsable?: { name: string; apellido: string };
    responsable2_id?: number;
    responsable2?: { name: string; apellido: string };
    vendedor_id?: number;
    vendedor?: Vendedor;
    tipo_movimiento: 'prestamo' | 'devolucion' | 'transferencia_salida' | 'transferencia_entrada';
    observaciones?: string;
    created_at: string;
    detalles: DetalleMovimiento[];
}

export interface DetalleMovimiento {
    id: number;
    movimiento_id: number;
    canastillo_id: number;
    canastillo?: Canastillo;
    cantidad: number; // puede ser negativo (salida) o positivo (entrada)
    saldo: number; // saldo después del movimiento
}

export interface InventarioItem {
    canastillo: Canastillo;
    saldo: number;
}

export interface DeudaDetalle {
    canastillo_id: number;
    canastillo?: Canastillo;
    prestado: number;
    devuelto: number;
    deuda_actual: number;
}

export interface DeudaVendedor {
    vendedor_id: number;
    vendedor?: Vendedor;
    detalles: DeudaDetalle[];
}
