from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import events
from config import settings  # Importer les paramètres de configuration

app = FastAPI(
    title="DatetimeEvents API",
    description="API pour gérer des événements horodatés",
    version="1.0.0",
    debug=settings.DEBUG  # Utiliser le paramètre DEBUG depuis la configuration
)

# Configuration CORS pour permettre les requêtes de notre frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Utiliser les origines depuis la configuration
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(events.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API DatetimeEvents",
        "environment": settings.API_ENV,  # Afficher l'environnement actuel
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Utiliser les paramètres de configuration pour le serveur
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG
    )