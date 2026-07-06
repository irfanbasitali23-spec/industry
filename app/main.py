from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.migrate import migrate_database
from app.routers import admin_router, auth_router, forms_router
from app.seed import seed_database

Base.metadata.create_all(bind=engine)
migrate_database()

app = FastAPI(title="Machine Inspection System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(forms_router.router)
app.include_router(admin_router.router)


@app.on_event("startup")
def startup():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
