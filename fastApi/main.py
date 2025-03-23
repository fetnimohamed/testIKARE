from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import events
from config import settings  

app = FastAPI(
    title="DatetimeEvents API",
    description="API pour gérer des événements horodatés",
    version="1.0.0",
    debug=settings.DEBUG  
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Bienvenue sur l'API DatetimeEvents",
        "environment": settings.API_ENV, 
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG
    )