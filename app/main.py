from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.migrate import migrate_database
from app.routers import admin_router, auth_router, forms_router
from app.seed import seed_database


def _init_db():
    Base.metadata.create_all(bind=engine)
    migrate_database()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_db()
    yield


app = FastAPI(title="Machine Inspection System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(forms_router.router)
app.include_router(admin_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
