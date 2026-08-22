from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin, ModelView
from app.models import init_db, engine, User, Resume, JobDescription, ResumeJobMatch, SpeechAnalysis, InterviewAnalysis
from app.api import router

app = FastAPI(
    title="HireSense AI API",
    description="Full-Stack Text & Speech Analysis Platform",
    version="1.0.0"
)

# Enable CORS for React Frontend (Support Vercel Domains & Localhost)
origins = [
    "https://hiresenseai-zeta.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register SQLAdmin (FastAPI's equivalent of Prisma Studio)
admin_ui = Admin(app, engine, title="HireSense AI Database Studio")

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.name, User.email, User.role, User.created_at]

class ResumeAdmin(ModelView, model=Resume):
    column_list = [Resume.id, Resume.user_id, Resume.file_name, Resume.score, Resume.created_at]

class JobDescriptionAdmin(ModelView, model=JobDescription):
    column_list = [JobDescription.id, JobDescription.user_id, JobDescription.title, JobDescription.created_at]

class ResumeJobMatchAdmin(ModelView, model=ResumeJobMatch):
    column_list = [ResumeJobMatch.id, ResumeJobMatch.user_id, ResumeJobMatch.job_title, ResumeJobMatch.match_score, ResumeJobMatch.created_at]

class SpeechAnalysisAdmin(ModelView, model=SpeechAnalysis):
    column_list = [SpeechAnalysis.id, SpeechAnalysis.user_id, SpeechAnalysis.file_name, SpeechAnalysis.words_per_minute, SpeechAnalysis.score, SpeechAnalysis.sentiment, SpeechAnalysis.created_at]

class InterviewAnalysisAdmin(ModelView, model=InterviewAnalysis):
    column_list = [InterviewAnalysis.id, InterviewAnalysis.user_id, InterviewAnalysis.overall_score, InterviewAnalysis.created_at]

admin_ui.add_view(UserAdmin)
admin_ui.add_view(ResumeAdmin)
admin_ui.add_view(JobDescriptionAdmin)
admin_ui.add_view(ResumeJobMatchAdmin)
admin_ui.add_view(SpeechAnalysisAdmin)
admin_ui.add_view(InterviewAnalysisAdmin)

@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(router)

# Fallback compatibility redirects for legacy /auth calls without /api prefix
from fastapi.responses import RedirectResponse
from fastapi import Request

@app.post("/auth/login")
async def redirect_auth_login():
    return RedirectResponse(url="/api/auth/login", status_code=307)

@app.post("/auth/register")
async def redirect_auth_register():
    return RedirectResponse(url="/api/auth/register", status_code=307)

@app.post("/auth/forgot-password")
async def redirect_auth_forgot_password():
    return RedirectResponse(url="/api/auth/forgot-password", status_code=307)

@app.get("/")
def read_root():
    return {"message": "HireSense AI API Service Running"}
