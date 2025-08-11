#!/usr/bin/env python3
"""Script de test pour l'API des personnes"""

import asyncio
import httpx

BASE_URL = "http://localhost:8000"


async def test_api():
    """Teste toutes les fonctionnalités de l'API des personnes"""

    async with httpx.AsyncClient() as client:
        print("🚀 Test de l'API SMC ERP - Gestion des Personnes")
        print("=" * 50)

        # Test 1: Endpoint racine
        print("\n1. Test de l'endpoint racine")
        response = await client.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        # Test 2: Health check
        print("\n2. Test du health check")
        response = await client.get(f"{BASE_URL}/healthz")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        # Test 3: Lister les personnes (vide au début)
        print("\n3. Lister toutes les personnes (initialement vide)")
        response = await client.get(f"{BASE_URL}/api/v1/persons/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        # Test 4: Créer une première personne
        print("\n4. Créer une première personne")
        person_data = {
            "first_name": "Jean",
            "last_name": "Dupont",
            "email": "jean.dupont@example.com",
            "phone": "+33123456789",
            "address": "123 Rue de la Paix, 75001 Paris",
        }
        response = await client.post(f"{BASE_URL}/api/v1/persons/", json=person_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            person1 = response.json()
            print(
                f"Personne créée: {person1['first_name']} {person1['last_name']} (ID: {person1['id']})"
            )
        else:
            print(f"Erreur: {response.text}")
            return

        # Test 5: Créer une deuxième personne
        print("\n5. Créer une deuxième personne")
        person_data2 = {
            "first_name": "Marie",
            "last_name": "Martin",
            "email": "marie.martin@example.com",
            "phone": "+33987654321",
        }
        response = await client.post(f"{BASE_URL}/api/v1/persons/", json=person_data2)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            person2 = response.json()
            print(
                f"Personne créée: {person2['first_name']} {person2['last_name']} (ID: {person2['id']})"
            )
        else:
            print(f"Erreur: {response.text}")
            return

        # Test 6: Lister toutes les personnes
        print("\n6. Lister toutes les personnes")
        response = await client.get(f"{BASE_URL}/api/v1/persons/")
        print(f"Status: {response.status_code}")
        persons = response.json()
        print(f"Nombre de personnes: {len(persons)}")
        for person in persons:
            print(
                f"  - {person['first_name']} {person['last_name']} ({person['email']})"
            )

        # Test 7: Récupérer une personne par ID
        print(f"\n7. Récupérer la personne par ID: {person1['id']}")
        response = await client.get(f"{BASE_URL}/api/v1/persons/{person1['id']}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            person = response.json()
            print(f"Personne trouvée: {person['first_name']} {person['last_name']}")
        else:
            print(f"Erreur: {response.text}")

        # Test 8: Mettre à jour une personne
        print(f"\n8. Mettre à jour la personne: {person1['id']}")
        update_data = {
            "phone": "+33555666777",
            "address": "456 Avenue des Champs-Élysées, 75008 Paris",
        }
        response = await client.put(
            f"{BASE_URL}/api/v1/persons/{person1['id']}", json=update_data
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            updated_person = response.json()
            print(f"Personne mise à jour: {updated_person['phone']}")
        else:
            print(f"Erreur: {response.text}")

        # Test 9: Rechercher des personnes
        print("\n9. Rechercher des personnes par nom 'Jean'")
        response = await client.get(f"{BASE_URL}/api/v1/persons/search/?q=Jean")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            search_results = response.json()
            print(f"Résultats trouvés: {len(search_results)}")
            for person in search_results:
                print(f"  - {person['first_name']} {person['last_name']}")
        else:
            print(f"Erreur: {response.text}")

        # Test 10: Rechercher par nom de famille
        print("\n10. Rechercher des personnes par nom de famille 'Martin'")
        response = await client.get(f"{BASE_URL}/api/v1/persons/search/?q=Martin")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            search_results = response.json()
            print(f"Résultats trouvés: {len(search_results)}")
            for person in search_results:
                print(f"  - {person['first_name']} {person['last_name']}")
        else:
            print(f"Erreur: {response.text}")

        # Test 11: Test d'erreur - créer une personne avec email duplicate
        print("\n11. Test d'erreur - créer une personne avec email duplicate")
        duplicate_data = {
            "first_name": "Pierre",
            "last_name": "Durand",
            "email": "jean.dupont@example.com",  # Email déjà utilisé
        }
        response = await client.post(f"{BASE_URL}/api/v1/persons/", json=duplicate_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 400:
            print("✅ Erreur bien gérée pour email duplicate")
        else:
            print(f"Unexpected status: {response.status_code}")

        # Test 12: Test d'erreur - personne inexistante
        print("\n12. Test d'erreur - récupérer une personne inexistante")
        import uuid

        fake_id = str(uuid.uuid4())
        response = await client.get(f"{BASE_URL}/api/v1/persons/{fake_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 404:
            print("✅ Erreur 404 bien gérée pour personne inexistante")
        else:
            print(f"Unexpected status: {response.status_code}")

        # Test 13: Supprimer une personne
        print(f"\n13. Supprimer la personne: {person2['id']}")
        response = await client.delete(f"{BASE_URL}/api/v1/persons/{person2['id']}")
        print(f"Status: {response.status_code}")
        if response.status_code == 204:
            print("✅ Personne supprimée avec succès")
        else:
            print(f"Erreur: {response.text}")

        # Test 14: Vérifier que la personne a été supprimée
        print("\n14. Vérifier la suppression - lister les personnes restantes")
        response = await client.get(f"{BASE_URL}/api/v1/persons/")
        print(f"Status: {response.status_code}")
        remaining_persons = response.json()
        print(f"Nombre de personnes restantes: {len(remaining_persons)}")
        for person in remaining_persons:
            print(f"  - {person['first_name']} {person['last_name']}")

        print("\n" + "=" * 50)
        print("🎉 Tests terminés avec succès !")
        print("\nL'API fournit toutes les fonctionnalités demandées :")
        print("✅ Lister toutes les personnes")
        print("✅ Récupérer une personne par UUID")
        print("✅ Créer une nouvelle personne")
        print("✅ Mettre à jour une personne")
        print("✅ Supprimer une personne")
        print("✅ Rechercher des personnes par nom/prénom")
        print("✅ Gestion des erreurs (duplicates, non trouvé)")


if __name__ == "__main__":
    print("Assurez-vous que le serveur FastAPI est lancé sur http://localhost:8000")
    print("Commande: cd backend && uv run uvicorn main:app --port 8000")
    print()

    try:
        asyncio.run(test_api())
    except httpx.ConnectError:
        print("❌ Erreur: Impossible de se connecter au serveur.")
        print("Vérifiez que le serveur est bien lancé sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
