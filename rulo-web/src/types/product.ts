export type Genero = 'hombre' | 'mujer' | 'unisex';

export type Linea = 'arabe' | 'disenador';

export type CollectionName =
  | 'perfumes'
  | 'decants'
  | 'promos'
  | 'desodorantes'
  | 'bodysplash'
  | 'cremas';

export interface Product {
  id: number;
  nombre: string;
  marca: string;
  genero: string;
  ml: number;
  tipo: string;
  precio: number;
  precio_descuento?: number | null;
  precio_mayorista?: number | null;
  linea?: Linea;
  imagen: string;
  descripcion?: string;
  notas_salida?: string;
  notas_corazon?: string;
  notas_fondo?: string;
  stock?: boolean;
  activo?: boolean;
  /** Injected client-side: which Firestore collection this doc came from. */
  _seccion?: CollectionName;
}

export interface Section {
  nombre: string;
  imagen: string;
  link: string;
}

export const COLLECTIONS: CollectionName[] = [
  'perfumes',
  'decants',
  'promos',
  'desodorantes',
  'bodysplash',
  'cremas',
];
