import os
import json
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator 
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DB_NAME: str = "event_store"
    MONGODB_COLLECTION: str = "events"
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
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


settings = Settings()