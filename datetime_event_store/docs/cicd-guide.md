# Guide d'intégration CI/CD pour DatetimeEventStore

Ce document explique comment utiliser les configurations CI/CD fournies pour automatiser les tests, la validation et le déploiement du package `DatetimeEventStore`.

## Configurations disponibles

Plusieurs configurations sont disponibles selon votre environnement:

1. **GitHub Actions** - Pour les projets hébergés sur GitHub
2. **GitLab CI/CD** - Pour les projets hébergés sur GitLab
3. **Dockerisation** - Pour le déploiement dans des environnements conteneurisés

## Configuration GitHub Actions

### Installation

1. Créez un répertoire `.github/workflows/` à la racine de votre projet:

   ```bash
   mkdir -p .github/workflows/
   ```

2. Copiez le fichier `python-package.yml` dans ce répertoire.

3. Configurez les secrets dans votre dépôt GitHub:
   - `TEST_PYPI_API_TOKEN` - Token pour TestPyPI
   - `PYPI_API_TOKEN` - Token pour PyPI (pour le déploiement final)

### Fonctionnalités

- **Tests automatiques** sur plusieurs versions de Python
- **Validation du code** avec flake8
- **Couverture de code** avec pytest-cov
- **Publication automatique** sur TestPyPI pour les branches principales
- **Publication manuelle** sur PyPI pour les tags

## Configuration GitLab CI/CD

### Installation

1. Copiez le fichier `.gitlab-ci.yml` à la racine de votre projet.

2. Configurez les variables CI/CD dans les paramètres de votre projet GitLab:
   - `TESTPYPI_TOKEN` - Token pour TestPyPI
   - `PYPI_TOKEN` - Token pour PyPI (pour le déploiement final)

### Fonctionnalités

- **Pipeline de quatre étapes**: lint, test, build, deploy
- **Tests sur plusieurs versions** de Python
- **Mise en cache des dépendances** pour accélérer les builds
- **Génération de rapports de couverture**
- **Déploiement manuel** vers TestPyPI et PyPI

## Dockerisation

### Utilisation basique

1. Construire l'image:

   ```bash
   docker build -t datetime-event-store .
   ```

2. Exécuter l'exemple par défaut:
   ```bash
   docker run datetime-event-store
   ```

### Utilisation avec Docker Compose

Le fichier `docker-compose.yml` définit trois services:

1. **app** - Exécute l'exemple de base

   ```bash
   docker-compose up app
   ```

2. **test** - Exécute les tests unitaires

   ```bash
   docker-compose up test
   ```

3. **lint** - Vérifie la qualité du code
   ```bash
   docker-compose up lint
   ```

## Personnalisation

Vous pouvez personnaliser ces configurations selon vos besoins spécifiques:

- Ajoutez des étapes de déploiement supplémentaires
- Configurez des notifications Slack/Email
- Ajoutez des vérifications de sécurité
- Configurez des rapports de qualité de code

## Intégration avec d'autres outils

Ces configurations peuvent être facilement étendues pour inclure:

- SonarQube pour l'analyse approfondie du code
- CodeCov ou Coveralls pour le suivi de la couverture de code
- Snyk pour l'analyse de vulnérabilités
