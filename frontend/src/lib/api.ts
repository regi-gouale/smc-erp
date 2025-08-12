import { Person, PersonCreate, PersonUpdate, SearchParams } from '@/types/person';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
    throw new ApiError(response.status, error.detail || 'Une erreur est survenue');
  }

  // Pour les réponses 204 (No Content), retourner un objet vide
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const personApi = {
  // Lister toutes les personnes
  async getAll(params: { skip?: number; limit?: number } = {}): Promise<Person[]> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest<Person[]>(`/api/v1/persons/${query ? `?${query}` : ''}`);
  },

  // Récupérer une personne par ID
  async getById(id: string): Promise<Person> {
    return apiRequest<Person>(`/api/v1/persons/${id}`);
  },

  // Créer une nouvelle personne
  async create(person: PersonCreate): Promise<Person> {
    return apiRequest<Person>('/api/v1/persons/', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  },

  // Mettre à jour une personne
  async update(id: string, person: PersonUpdate): Promise<Person> {
    return apiRequest<Person>(`/api/v1/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  },

  // Supprimer une personne
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/persons/${id}`, {
      method: 'DELETE',
    });
  },

  // Rechercher des personnes
  async search(params: SearchParams): Promise<Person[]> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.set('limit', params.limit.toString());
    
    return apiRequest<Person[]>(`/api/v1/persons/search?${searchParams.toString()}`);
  },
};

export { ApiError };
