# Gestionnaire d'Événements Horodatés

Un système complet de gestion d'événements temporels comprenant un package Python, une API REST et une interface utilisateur React.

## Vue d'ensemble

Ce projet implémente une solution complète pour stocker, récupérer et manipuler des événements associés à des dates. Il est composé de trois parties principales :

1. **DatetimeEventStore** - Un package Python pour la gestion d'événements temporels
2. **API FastAPI** - Une API REST exposant les fonctionnalités du package
3. **Interface React** - Une application frontend pour interagir avec l'API

## Fonctionnalités clés

- Création, lecture, mise à jour et suppression d'événements horodatés
- Recherche efficace d'événements par plage de dates
- Interface utilisateur intuitive avec filtrage et tri
- Stockage persistant avec MongoDB
- API REST bien documentée

## Architecture

```
┌─────────────────────┐      ┌────────────────────────┐      ┌─────────────────┐
│                     │      │                        │      │                 │
│  Frontend React     │<────>│  API REST FastAPI      │<────>│  MongoDB        │
│  (Material-UI)      │      │  (DatetimeEventStore)  │      │                 │
│                     │      │                        │      │                 │
└─────────────────────┘      └────────────────────────┘      └─────────────────┘
```

## Prérequis

- Python 3.10+
- Node.js 16+
- MongoDB
- Docker et Docker Compose (optionnel)

## Installation rapide

La façon la plus simple de démarrer l'application complète est d'utiliser Docker Compose :

```bash
docker-compose up -d
```

Cela lancera :

- Le frontend sur http://localhost:3000
- L'API sur http://localhost:8000
- Une instance MongoDB

## Installation manuelle

### 1. Package Python DatetimeEventStore

```bash
cd datetime_event_store
pip install -e .
```

### 2. API FastAPI

```bash
cd fastApi
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend React

```bash
cd datetime-events-app
npm install
npm start
```

## Structure du projet

```
projet-racine/
├── datetime-events-app/    # Application React
├── datetime_event_store/   # Package Python
├── fastApi/               # API REST
├── docker-compose.yml     # Configuration Docker Compose
└── README.md              # Ce fichier
```

## Tests

Chaque composant dispose de ses propres tests :

```bash
# Tests du package Python
cd datetime_event_store
python -m unittest discover

# Tests de l'API
cd fastApi
pytest

# Tests du frontend
cd datetime-events-app
npm test
```

## Documentation

- La documentation de l'API est disponible sur http://localhost:8000/docs
- Consultez les fichiers README.md dans chaque sous-répertoire pour plus d'informations
- Les rapports complets de conception sont disponibles dans le dossier `docs/`

## Exemples d'utilisation

### Utilisation du package Python

```python
from datetime import datetime
from datetime_event_store import DatetimeEventStore

store = DatetimeEventStore()
store.store_
```
