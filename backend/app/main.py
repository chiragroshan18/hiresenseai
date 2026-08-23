from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqladmin import Admin, ModelView
from app.models import init_db, engine, User, Resume, JobDescription, ResumeJobMatch, SpeechAnalysis, InterviewAnalysis
from app.api import router

app = FastAPI(
    title="HireSense AI API",
    description="Full-Stack Text & Speech Analysis Platform",
    version="1.0.0"
)

# Enable CORS for React Frontend (Support Vercel Domains, Mobile Browsers & Localhost)
allowed_origins = [
    "https://hiresenseai-zeta.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom CORS & OPTIONS Preflight Response Middleware for Mobile Browsers (iOS Safari, Android Chrome)
@app.middleware("http")
async def custom_cors_and_exception_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Direct OPTIONS preflight handling for mobile phone browsers
    if request.method == "OPTIONS":
        response = JSONResponse(status_code=200, content={"status": "OK"})
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        response = JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(exc)}"}
        )

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

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
    try:
        from app.seed import seed_data
        seed_data()
    except Exception as e:
        print("Startup seed notice:", e)

app.include_router(router)

# Direct alias endpoints for non-/api paths to prevent CORS redirect failures
from app.api import login as login_handler, register as register_handler, forgot_password as forgot_password_handler, UserLogin, UserRegister, ForgotPassword
from app.auth import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

@app.post("/auth/login")
def unprefixed_login(data: UserLogin, db: Session = Depends(get_db)):
    return login_handler(data, db)

@app.post("/auth/register")
def unprefixed_register(data: UserRegister, db: Session = Depends(get_db)):
    return register_handler(data, db)

@app.post("/auth/forgot-password")
def unprefixed_forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    return forgot_password_handler(data, db)

@app.get("/")
def read_root():
    return {"message": "HireSense AI API Service Running"}

