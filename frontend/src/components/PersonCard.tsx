import { Person } from '@/types/person';
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <TooltipProvider>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(person.first_name, person.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {person.first_name} {person.last_name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(person.created_at)}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(person)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifier</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(person)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supprimer</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {person.email && (
              <div className="flex items-center space-x-3 group">
                <div className="flex-shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <a
                  href={`mailto:${person.email}`}
                  className="text-sm text-blue-600 hover:underline truncate flex-1 group-hover:text-blue-700 transition-colors"
                >
                  {person.email}
                </a>
              </div>
            )}

            {person.phone && (
              <div className="flex items-center space-x-3 group">
                <div className="flex-shrink-0">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <a
                  href={`tel:${person.phone}`}
                  className="text-sm text-foreground hover:text-blue-600 flex-1 group-hover:text-blue-700 transition-colors"
                >
                  {person.phone}
                </a>
              </div>
            )}

            {person.address && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                  {person.address}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Modifié le {formatDate(person.updated_at)}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                ID: {person.id}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
