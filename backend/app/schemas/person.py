import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class PersonBase(BaseModel):
    """Schéma de base pour Person"""

    first_name: str = Field(
        ..., min_length=1, max_length=100, description="Prénom de la personne"
    )
    last_name: str = Field(
        ..., min_length=1, max_length=100, description="Nom de famille de la personne"
    )
    email: Optional[EmailStr] = Field(None, description="Adresse email de la personne")
    phone: Optional[str] = Field(None, max_length=20, description="Numéro de téléphone")
    address: Optional[str] = Field(None, description="Adresse complète")


class PersonCreate(PersonBase):
    """Schéma pour la création d'une personne"""

    pass


class PersonUpdate(BaseModel):
    """Schéma pour la mise à jour d'une personne"""

    first_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Prénom de la personne"
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Nom de famille de la personne"
    )
    email: Optional[EmailStr] = Field(None, description="Adresse email de la personne")
    phone: Optional[str] = Field(None, max_length=20, description="Numéro de téléphone")
    address: Optional[str] = Field(None, description="Adresse complète")


class PersonRead(PersonBase):
    """Schéma pour la lecture d'une personne"""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PersonSearchParams(BaseModel):
    """Paramètres de recherche pour les personnes"""

    query: Optional[str] = Field(None, description="Terme de recherche (nom ou prénom)")
    limit: int = Field(10, ge=1, le=100, description="Nombre de résultats maximum")
    offset: int = Field(0, ge=0, description="Décalage pour la pagination")
