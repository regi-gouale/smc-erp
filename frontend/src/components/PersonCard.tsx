import { Person } from '@/types/person';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
}

export function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* En-tête avec nom et actions */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {person.first_name} {person.last_name}
          </h3>
          <p className="text-sm text-gray-500">
            Créé le {formatDate(person.created_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(person)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(person)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="space-y-3">
        {person.email && (
          <div className="flex items-center space-x-3">
            <Mail size={16} className="text-gray-400" />
            <a
              href={`mailto:${person.email}`}
              className="text-blue-600 hover:underline"
            >
              {person.email}
            </a>
          </div>
        )}

        {person.phone && (
          <div className="flex items-center space-x-3">
            <Phone size={16} className="text-gray-400" />
            <a
              href={`tel:${person.phone}`}
              className="text-gray-700 hover:text-blue-600"
            >
              {person.phone}
            </a>
          </div>
        )}

        {person.address && (
          <div className="flex items-start space-x-3">
            <MapPin size={16} className="text-gray-400 mt-0.5" />
            <p className="text-gray-700 text-sm">{person.address}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <Calendar size={14} />
            <span>Modifié le {formatDate(person.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
