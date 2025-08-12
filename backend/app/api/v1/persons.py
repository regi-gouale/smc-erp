import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, delete

from app.core.db import get_db
from app.models.person import Person
from app.schemas.person import PersonCreate, PersonUpdate, PersonRead

router = APIRouter()


@router.get("/", response_model=List[PersonRead], summary="Lister toutes les personnes")
async def get_persons(
    skip: int = Query(0, ge=0, description="Nombre d'éléments à ignorer"),
    limit: int = Query(10, ge=1, le=100, description="Nombre d'éléments à retourner"),
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère la liste de toutes les personnes avec pagination.
    """
    stmt = select(Person).offset(skip).limit(limit).order_by(Person.created_at.desc())
    result = await db.execute(stmt)
    persons = result.scalars().all()
    return persons


@router.get(
    "/search", response_model=List[PersonRead], summary="Rechercher des personnes"
)
async def search_persons(
    q: str = Query(..., min_length=1, description="Terme de recherche (nom ou prénom)"),
    skip: int = Query(0, ge=0, description="Nombre d'éléments à ignorer"),
    limit: int = Query(10, ge=1, le=100, description="Nombre d'éléments à retourner"),
    db: AsyncSession = Depends(get_db),
):
    """
    Recherche des personnes par nom ou prénom.
    La recherche est insensible à la casse et peut contenir des parties de mots.
    """
    search_term = f"%{q.lower()}%"

    stmt = (
        select(Person)
        .where(
            or_(
                func.lower(Person.first_name).like(search_term),
                func.lower(Person.last_name).like(search_term),
                func.lower(func.concat(Person.first_name, " ", Person.last_name)).like(
                    search_term
                ),
            )
        )
        .offset(skip)
        .limit(limit)
        .order_by(Person.first_name, Person.last_name)
    )

    result = await db.execute(stmt)
    persons = result.scalars().all()

    return persons


@router.get(
    "/{person_id}", response_model=PersonRead, summary="Récupérer une personne par UUID"
)
async def get_person(
    person_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère une personne spécifique par son UUID.
    """
    stmt = select(Person).where(Person.id == person_id)
    result = await db.execute(stmt)
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Personne non trouvée")

    return person


@router.post(
    "/",
    response_model=PersonRead,
    status_code=201,
    summary="Créer une nouvelle personne",
)
async def create_person(
    person_data: PersonCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Crée une nouvelle personne dans la base de données.
    """
    # Vérifier si l'email existe déjà (si fourni)
    if person_data.email:
        stmt = select(Person).where(Person.email == person_data.email)
        result = await db.execute(stmt)
        existing_person = result.scalar_one_or_none()
        if existing_person:
            raise HTTPException(
                status_code=400, detail="Une personne avec cet email existe déjà"
            )

    # Créer la nouvelle personne
    person = Person(**person_data.model_dump())
    db.add(person)
    await db.commit()
    await db.refresh(person)

    return person


@router.put(
    "/{person_id}", response_model=PersonRead, summary="Mettre à jour une personne"
)
async def update_person(
    person_id: uuid.UUID,
    person_data: PersonUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Met à jour les informations d'une personne existante.
    """
    # Récupérer la personne existante
    stmt = select(Person).where(Person.id == person_id)
    result = await db.execute(stmt)
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Personne non trouvée")

    # Vérifier l'unicité de l'email si modifié
    if person_data.email and person_data.email != person.email:
        stmt = select(Person).where(Person.email == person_data.email)
        result = await db.execute(stmt)
        existing_person = result.scalar_one_or_none()
        if existing_person:
            raise HTTPException(
                status_code=400, detail="Une personne avec cet email existe déjà"
            )

    # Mettre à jour les champs modifiés
    update_data = person_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(person, field, value)

    await db.commit()
    await db.refresh(person)

    return person


@router.delete("/{person_id}", status_code=204, summary="Supprimer une personne")
async def delete_person(
    person_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Supprime une personne de la base de données.
    """
    # Vérifier que la personne existe
    stmt = select(Person).where(Person.id == person_id)
    result = await db.execute(stmt)
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Personne non trouvée")

    # Supprimer la personne
    stmt = delete(Person).where(Person.id == person_id)
    await db.execute(stmt)
    await db.commit()
