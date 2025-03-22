import os
import json
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator  # Notez: validator est devenu field_validator dans Pydantic v2
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

class Settings(BaseSettings):
    # Paramètres généraux de l'API
    API_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"
    
    # Paramètres du serveur
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configuration MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DB_NAME: str = "event_store"
    MONGODB_COLLECTION: str = "events"
    
    # Configuration CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Clé secrète pour la sécurité
    API_SECRET_KEY: str = "your-secret-key-change-in-production"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Créer une instance des paramètres
settings = Settings()