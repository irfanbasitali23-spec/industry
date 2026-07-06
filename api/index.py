"""Vercel serverless entry — exposes FastAPI app at /api/*"""
from app.main import app  # noqa: F401
