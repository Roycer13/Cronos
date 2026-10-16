  export interface GrupoEnvasadoras {
    id: string;
    nombre: string;
    gridClass: string;
    orden: number;
    tipo: 'grupo';
    envasadoras: string[];
  }

  export interface PosicionTanque {
    id: string;
    nombre: string;
    gridClass: string;
    orden: number;
    tipo?: 'individual' | 'grupo';
  }

  export const gruposEnvasadoras: GrupoEnvasadoras[] = [
    // Grupo de Vasos
    {
      id: 'grupo-vasos',
      nombre: 'Envasadoras Vasos',
      gridClass: 'col-span-2 row-span-1',
      orden: 24,
      tipo: 'grupo',
      envasadoras: ['V1', 'V2', 'V3', 'EMBOTELLADORA']
    },

    // Grupo de Soya
    {
      id: 'grupo-soya',
      nombre: 'Envasadoras Soya',
      gridClass: 'col-span-2 row-span-1',
      orden: 26,
      tipo: 'grupo',
      envasadoras: ['L1', 'L2', 'L3']
    },

    // Grupo HTST 1
    {
      id: 'grupo-htst1',
      nombre: 'HTST',
      gridClass: 'col-span-4 row-span-1',
      orden: 23,
      tipo: 'grupo',
      envasadoras: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C']
    },

    // Grupo UHT
    {
      id: 'grupo-uht',
      nombre: 'Envasadoras UHT',
      gridClass: 'col-span-3 row-span-1',
      orden: 25,
      tipo: 'grupo',
      envasadoras: ['1A', '1B', '1C', '2A', '2B', '3A', '3B']
    },
  ];

  // Layout combinado (tanques individuales + grupos)
  export const layoutCompleto: (PosicionTanque | GrupoEnvasadoras)[] = [
    // ... tus tanques individuales existentes ...
    { id: 'R1', nombre: 'R1', gridClass: 'col-span-1 row-span-1', orden: 1 },
    { id: 'TK MIX1', nombre: 'TK MIX1', gridClass: 'col-span-1 row-span-1', orden: 2 },
    { id: 'TK MIX2', nombre: 'TK MIX2', gridClass: 'col-span-1 row-span-1', orden: 3 },
    { id: 'TK MIX3', nombre: 'TK MIX3', gridClass: 'col-span-1 row-span-1', orden: 4 },
    { id: 'TK MIX4', nombre: 'TK MIX4', gridClass: 'col-span-1 row-span-1', orden: 5 },
    { id: 'Ttk Quesos', nombre: 'Ttk Quesos', gridClass: 'col-span-1 row-span-1', orden: 6 },
    { id: 'TKAUX1', nombre: 'TKAUX1', gridClass: 'col-span-1 row-span-1', orden: 7 },
    { id: 'R2', nombre: 'R2', gridClass: 'col-span-1 row-span-1', orden: 8 },
    { id: 'TK5', nombre: 'TK5', gridClass: 'col-span-1 row-span-1', orden: 9 },
    { id: 'TK MP', nombre: 'TK MP', gridClass: 'col-span-1 row-span-1', orden: 10 },
    { id: 'TK MG', nombre: 'TK MG', gridClass: 'col-span-1 row-span-1', orden: 11 },
    { id: 'TK 42', nombre: 'TK 42', gridClass: 'col-span-1 row-span-1', orden: 12 },
    { id: 'TK 41', nombre: 'TK 41', gridClass: 'col-span-1 row-span-1', orden: 13 },
    { id: 'TKAUX2', nombre: 'TKAUX2', gridClass: 'col-span-1 row-span-1', orden: 14 },
    { id: 'R3', nombre: 'R3', gridClass: 'col-span-1 row-span-1', orden: 15 },
    { id: 'TK10', nombre: 'TK10', gridClass: 'col-span-1 row-span-1', orden: 16 },
    { id: 'TK FP', nombre: 'TK FP', gridClass: 'col-span-1 row-span-1', orden: 17 },
    { id: 'TK FG', nombre: 'TK FG', gridClass: 'col-span-1 row-span-1', orden: 18 },
    { id: 'TK SC', nombre: 'TK SC', gridClass: 'col-span-1 row-span-1', orden: 19 },
    { id: 'TK CC', nombre: 'TK CC', gridClass: 'col-span-1 row-span-1', orden: 20 },
    { id: 'TK SY', nombre: 'TK SY', gridClass: 'col-span-1 row-span-1', orden: 21 },
    { id: 'TK11', nombre: 'TK11', gridClass: 'col-span-1 row-span-1', orden: 22 }, // <-- Quita el punto y coma aquí

    // Agregar grupos de envasadoras
    ...gruposEnvasadoras
  ]; // <-- Cierra el array layoutCompleto



  export const envasadoraIdMap: Record<string, Record<string, number>> = {
    // HTST - sector 7
    'grupo-htst1': {
      '1A': 43, '1B': 42, '1C': 41,
      '2A': 40, '2B': 39, '2C': 38,
      '3A': 37, '3B': 36, '3C': 35,
      '4A': 34, '4B': 33, '4C': 32,
      '5A': 31, '5B': 30, '5C': 29
    },
    // UHT - sector 8
    'grupo-uht': {
      '1A': 22, '1B': 23, '1C': 24,
      '2A': 25, '2B': 26,
      '3A': 27, '3B': 28
    },
    // Vasos - sector 9
    'grupo-vasos': {
      'V1': 45, 'V2': 46, 'V3': 47, 'EMBOTELLADORA': 48
    },
    // Soya - sector 76
    'grupo-soya': {
      'L1': 52, 'L2': 53, 'L3': 54
    }
  };

  // Mapeo para tanques individuales
  export const tanqueIndividualIdMap: Record<string, number> = {
    'R1': 1,
    'TK MIX1': 8,
    'TK MIX2': 6,
    'TK MIX3': 5,
    'TK MIX4': 9,
    'Ttk Quesos': 10,
    'TKAUX1': 49,
    'R2': 2,
    'TK5': 14,
    'TK MP': 44,
    'TK MG': 16,
    'TK 42': 7,
    'TK 41': 4,
    'TKAUX2': 50,
    'R3': 3,
    'TK10': 12,
    'TK FP': 13,
    'TK FG': 15,
    'TK SC': 18,
    'TK CC': 17,
    'TK SY': 51,
    'TK11': 55
  };