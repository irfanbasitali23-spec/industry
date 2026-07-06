from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.migrate import migrate_database
from app.routers import admin_router, auth_router, forms_router
from app.seed import seed_database


def _init_db():
    from sqlalchemy.exc import OperationalError

    try:
        Base.metadata.create_all(bind=engine)
        migrate_database()
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except OperationalError as exc:
        if "localhost" in str(settings.database_url) or "127.0.0.1" in str(settings.database_url):
            raise SystemExit(
                "\n[DATABASE ERROR] Cannot connect to PostgreSQL on localhost.\n\n"
                "Local fix:  docker compose up --build\n"
                "Cloud fix:  set DATABASE_URL to Neon connection string on Render (see README.md)\n"
            ) from exc
        raise


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
