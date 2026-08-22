import re
import hashlib
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import JWT_SECRET, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
from app import models

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def hash_password(password: str) -> str:
    # Truncate string to avoid bcrypt 72 byte error in passlib
    clean_pass = password[:72]
    return pwd_context.hash(clean_pass)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    clean_pass = plain_password[:72]
    try:
        if pwd_context.verify(clean_pass, hashed_password):
            return True
    except Exception:
        pass
    import hashlib
    if hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password:
        return True
    return plain_password == hashed_password

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:





    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if role == "admin" and email == ADMIN_EMAIL:
        return {"id": 0, "name": ADMIN_NAME, "email": ADMIN_EMAIL, "role": "admin"}

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: dict = Depends(get_current_user)):
    user_role = getattr(current_user, "role", None) if hasattr(current_user, "role") else current_user.get("role")
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
