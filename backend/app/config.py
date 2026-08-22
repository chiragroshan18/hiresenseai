import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hiresense.db") # Falls back to SQLite if Neon PostgreSQL URL isn't configured
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-hiresense-2026-xyz")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "chirag@hiresense.ai")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "123456")
ADMIN_NAME = "Chirag Roshan"

