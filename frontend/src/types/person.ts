// Types pour l'API des personnes

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PersonUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}


export interface SearchParams {
  q?: string;
  skip?: number;
  limit?: number;
}
