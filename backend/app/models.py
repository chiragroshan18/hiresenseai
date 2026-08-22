from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from app.config import DATABASE_URL

# Support PostgreSQL & SQLite fallbacks transparently
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user") # 'user' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    job_matches = relationship("ResumeJobMatch", back_populates="owner", cascade="all, delete-orphan")
    speech_analyses = relationship("SpeechAnalysis", back_populates="owner", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    extracted_text = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    skills = Column(Text, nullable=True) # JSON or CSV string
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="resumes")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class ResumeJobMatch(Base):
    __tablename__ = "resume_job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    job_title = Column(String(255), nullable=False)
    match_score = Column(Float, default=0.0)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="job_matches")

class SpeechAnalysis(Base):
    __tablename__ = "speech_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    transcript = Column(Text, nullable=False)
    duration = Column(Float, default=0.0)
    word_count = Column(Integer, default=0)
    words_per_minute = Column(Float, default=0.0)
    filler_word_count = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    sentiment = Column(String(50), default="Neutral")
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="speech_analyses")
    interview_analyses = relationship("InterviewAnalysis", back_populates="speech_analysis", cascade="all, delete-orphan")

class InterviewAnalysis(Base):
    __tablename__ = "interview_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    speech_analysis_id = Column(Integer, ForeignKey("speech_analyses.id"), nullable=True, index=True)
    relevance_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    vocabulary_score = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    speech_analysis = relationship("SpeechAnalysis", back_populates="interview_analyses")

def init_db():
    Base.metadata.create_all(bind=engine)

