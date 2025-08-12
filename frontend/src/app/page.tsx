'use client';

import { useState, useEffect } from 'react';
import { Person, PersonCreate, PersonUpdate } from '@/types/person';
import { personApi, ApiError } from '@/lib/api';
import { PersonCard } from '@/components/PersonCard';
import { PersonForm } from '@/components/PersonForm';
import { Search, Plus, Users, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger toutes les personnes
  const loadPersons = async () => {
    try {
      setError(null);
      const data = await personApi.getAll();
      setPersons(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Rechercher des personnes
  const searchPersons = async (query: string) => {
    if (!query.trim()) {
      loadPersons();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const results = await personApi.search({ q: query });
      setPersons(results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  // Soumettre le formulaire (création ou modification)
  const handleFormSubmit = async (data: PersonCreate | PersonUpdate) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingPerson) {
        const updatedPerson = await personApi.update(editingPerson.id, data as PersonUpdate);
        setPersons(prev => prev.map(p => p.id === editingPerson.id ? updatedPerson : p));
      } else {
        const newPerson = await personApi.create(data as PersonCreate);
        setPersons(prev => [newPerson, ...prev]);
      }

      setShowForm(false);
      setEditingPerson(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer une personne
  const handleDelete = async (person: Person) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${person.first_name} ${person.last_name} ?`)) {
      return;
    }

    try {
      setError(null);
      await personApi.delete(person.id);
      setPersons(prev => prev.filter(p => p.id !== person.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Ouvrir le formulaire de modification
  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPerson(null);
  };

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPersons(searchQuery);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchQuery('');
    loadPersons();
  };

  // Charger les données au montage
  useEffect(() => {
    loadPersons();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SMC ERP</h1>
                <p className="text-gray-600">Gestion des Personnes</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Ajouter une personne</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou prénom..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {isSearching ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              <span>Rechercher</span>
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Effacer
              </button>
            )}
          </form>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* État de chargement */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="mb-6 text-sm text-gray-600">
              {searchQuery ? (
                <span>{persons.length} résultat(s) pour "{searchQuery}"</span>
              ) : (
                <span>{persons.length} personne(s) au total</span>
              )}
            </div>

            {/* Liste des personnes */}
            {persons.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune personne enregistrée'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Essayez avec d\'autres termes de recherche.'
                    : 'Commencez par ajouter votre première personne.'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter une personne
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {persons.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de formulaire */}
      {showForm && (
        <PersonForm
          person={editingPerson || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
