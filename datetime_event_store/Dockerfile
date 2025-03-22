# Dockerfile pour DatetimeEventStore
FROM python:3.10-slim

WORKDIR /app

# Copier les fichiers de configuration et installation
COPY setup.py README.md ./
COPY datetime_event_store ./datetime_event_store/
COPY examples ./examples/

# Installation du package en mode développement
RUN pip install --no-cache-dir -e .

# Port par défaut pour une éventuelle API future
EXPOSE 8000

# Exécuter l'exemple par défaut
CMD ["python", "examples/basic_usage.py"]