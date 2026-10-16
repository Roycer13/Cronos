import { tanqueIndividualIdMap } from './tanquesLayout';

export interface Sala {
  id: string;
  nombre: string;
  origenIds: number[];
  gridClass?: string;
}

export const salas: Sala[] = [
  {
    id: 'pasteurizado',
    nombre: 'Pasteurizado',
    origenIds: [
      tanqueIndividualIdMap['TK MIX1'],
      tanqueIndividualIdMap['TK MIX2'],
      tanqueIndividualIdMap['TK MIX3'],
      tanqueIndividualIdMap['TK MIX4'],
      tanqueIndividualIdMap['TK 41'],
      tanqueIndividualIdMap['TK 42'],
    ].filter(id => id !== undefined), // Filtrar si algún ID no existe
  },
  {
    id: 'saborizado',
    nombre: 'Saborizado',
    origenIds: [
      tanqueIndividualIdMap['TK11'],
      tanqueIndividualIdMap['TK10'],
      tanqueIndividualIdMap['TK5'],
      tanqueIndividualIdMap['TK FP'],
      tanqueIndividualIdMap['TK MP'],
      tanqueIndividualIdMap['TK FG'],
      tanqueIndividualIdMap['TK MG'],
    ].filter(id => id !== undefined),
  },
  {
    id: 'vasos',
    nombre: 'Vasos',
    origenIds: [
      tanqueIndividualIdMap['TK CC'],
      tanqueIndividualIdMap['TK SC'],
      tanqueIndividualIdMap['TKAUX1'],
      tanqueIndividualIdMap['TKAUX2'],
    ].filter(id => id !== undefined),
  },
  {
    id: 'recepcion',
    nombre: 'Recepción',
    origenIds: [
      tanqueIndividualIdMap['R1'],
      tanqueIndividualIdMap['R2'],
      tanqueIndividualIdMap['R3'],
    ].filter(id => id !== undefined),
  },
];

// Mapa rápido para buscar sala por ID de origen
export const salaPorOrigenId: Record<number, Sala> = {};
salas.forEach(sala => {
  sala.origenIds.forEach(id => {
    salaPorOrigenId[id] = sala;
  });
});