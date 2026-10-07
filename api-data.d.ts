export interface Persona {
  id: string;
  nombre: string;
  foto: string;
}

export interface Historia {
  student: string;
  teacher: string;
  twist: string;
  labels: string[];
  faces: string[];
  sfx: string[];
  photos?: string[];
  twistPhotos: string[];
}

export interface ApiData {
  nombre: string;
  version: string;
  tipo: string;
  personajes: Persona[];
  historias: Record<string, Historia[]>;
}

export type DataSource = 'online' | 'offline';

export interface LoadedApiData {
  data: ApiData;
  source: DataSource;
}

export interface DataServiceOptions {
  endpoint: string;
  fallback: string;
  fetcher?: typeof fetch;
  fallbackFetcher?: typeof fetch;
}

export interface DataService {
  load(): Promise<LoadedApiData>;
  getStatus(): Promise<LoadedApiData>;
}
