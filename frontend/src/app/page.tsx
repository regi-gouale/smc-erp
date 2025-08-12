'use client';

import { useState, useEffect } from 'react';
import { Person, PersonCreate, PersonUpdate } from '@/types/person';
import { personApi, ApiError } from '@/lib/api';
import { PersonCard } from '@/components/PersonCard';
import { PersonForm } from '@/components/PersonForm';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Search, Plus, Users, AlertCircle, Loader2, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const handleDelete = (person: Person) => {
    setDeletingPerson(person);
  };

  const confirmDelete = async () => {
    if (!deletingPerson) return;

    try {
      setIsDeleting(true);
      setError(null);
      await personApi.delete(deletingPerson.id);
      setPersons(prev => prev.filter(p => p.id !== deletingPerson.id));
      setDeletingPerson(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
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
    <div className="min-h-screen bg-background">
      {/* En-tête moderne */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">SMC ERP</h1>
                  <p className="text-muted-foreground text-sm">Système de Gestion des Personnes</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button onClick={() => setShowForm(true)} size="default" className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle personne
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Section de recherche */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, prénom, email..."
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                variant="default"
                className="min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  onClick={clearSearch}
                  variant="outline"
                  size="default"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Messages d'erreur */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques et état */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {persons.length} {persons.length <= 1 ? 'personne' : 'personnes'}
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="text-sm">
                Résultats pour "{searchQuery}"
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* État de chargement */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Chargement des données...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Liste des personnes */}
            {persons.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 space-y-6">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {searchQuery ? 'Aucun résultat trouvé' : 'Aucune personne enregistrée'}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery 
                          ? 'Essayez avec d\'autres termes de recherche ou vérifiez l\'orthographe.'
                          : 'Commencez par ajouter votre première personne pour démarrer la gestion de votre répertoire.'
                        }
                      </p>
                    </div>
                    {!searchQuery && (
                      <Button onClick={() => setShowForm(true)} size="lg" className="shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter votre première personne
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <PersonForm
        open={showForm}
        person={editingPerson || undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
        isLoading={isSubmitting}
      />

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        open={!!deletingPerson}
        onOpenChange={(open) => !open && setDeletingPerson(null)}
        onConfirm={confirmDelete}
        title="Supprimer cette personne"
        description={
          deletingPerson
            ? `Êtes-vous sûr de vouloir supprimer ${deletingPerson.first_name} ${deletingPerson.last_name} ? Cette action est irréversible.`
            : ''
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
