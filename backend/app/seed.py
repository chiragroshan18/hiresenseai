from app import models, auth, config
import json

def seed_data():
    db = models.SessionLocal()
    try:
        # 1. Seed Admin Account
        admin = db.query(models.User).filter(models.User.email == config.ADMIN_EMAIL).first()
        if not admin:
            admin_user = models.User(
                name=config.ADMIN_NAME,
                email=config.ADMIN_EMAIL,
                password_hash=auth.hash_password(config.ADMIN_PASSWORD),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print(f"[Seed Success] Created demo Admin account: {config.ADMIN_EMAIL}")
        else:
            print(f"[Seed Info] Admin account already exists: {config.ADMIN_EMAIL}")

        # 2. Seed Test User Account & Evaluation Records
        test_user = db.query(models.User).filter(models.User.email == "testuser@hiresense.ai").first()
        if not test_user:
            test_user = models.User(
                name="John Doe",
                email="testuser@hiresense.ai",
                password_hash=auth.hash_password("123456"),
                role="user"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"[Seed Success] Created demo User account: testuser@hiresense.ai")

        # 3. Seed Demo Evaluation Records if user history is empty
        res_count = db.query(models.Resume).filter(models.Resume.user_id == test_user.id).count()
        if res_count == 0:
            demo_resume = models.Resume(
                user_id=test_user.id,
                file_name="Chirag_Roshan_Software_Engineer_Resume.pdf",
                extracted_text="Experienced Full Stack Software Engineer with expertise in Python, FastAPI, React, SQL, PostgreSQL, Tailwind CSS, and Git. Engineered high-throughput REST APIs and glassmorphic user interfaces.",
                score=85.0,
                skills=json.dumps(["Python", "FastAPI", "React", "SQL", "PostgreSQL", "Tailwind", "Git"])
            )
            demo_match = models.ResumeJobMatch(
                user_id=test_user.id,
                job_title="Senior Full Stack Engineer",
                match_score=75.0,
                matched_skills=json.dumps(["Python", "React", "PostgreSQL"]),
                missing_skills=json.dumps(["Docker", "AWS", "Kubernetes"])
            )
            demo_speech = models.SpeechAnalysis(
                user_id=test_user.id,
                file_name="Technical_Architecture_Interview_Response.wav",
                transcript="I led the backend architectural engineering for our recruitment platform using Python, FastAPI, React, Tailwind CSS, and PostgreSQL on Neon. We achieved a 45% increase in query speed by optimizing database indexes.",
                words_per_minute=125.0,
                word_count=42,
                filler_word_count=2,
                sentiment="Positive",
                score=86.0,
                recommendations=json.dumps(["Maintain steady articulation velocity.", "Great technical confidence!"])
            )

            db.add_all([demo_resume, demo_match, demo_speech])
            db.commit()
            print(f"[Seed Success] Seeded 3 sample evaluation records for testuser@hiresense.ai")

    except Exception as e:
        print(f"[Seed Error] Failed to seed database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    models.init_db()
    seed_data()
