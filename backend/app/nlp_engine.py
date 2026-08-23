import re
import json

KNOWN_SKILLS = [
    # Programming & Web Development
    "python", "java", "c++", "c#", "c", "ruby", "php", "swift", "kotlin", "go", "rust", "r", "matlab",
    "javascript", "typescript", "react", "next.js", "vue", "angular", "svelte", "html", "css", "tailwind", "bootstrap", "sass",
    "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "asp.net", "laravel",
    
    # Databases & Cloud Infrastructures
    "sql", "postgresql", "mysql", "sqlite", "mongodb", "redis", "dynamodb", "oracle", "cassandra", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible", "jenkins", "git", "github", "gitlab", "ci/cd",
    "rest api", "graphql", "microservices", "kafka", "rabbitmq", "linux", "bash", "powershell",
    
    # AI, Data Science & Analytics
    "machine learning", "deep learning", "nlp", "spacy", "nltk", "scikit-learn", "tensorflow", "pytorch", "keras",
    "pandas", "numpy", "scipy", "data analysis", "data science", "tableau", "power bi", "excel", "spark", "hadoop",
    
    # Business, Management & Soft Skills
    "communication", "leadership", "agile", "scrum", "jira", "confluence", "problem solving", "critical thinking",
    "project management", "time management", "teamwork", "collaboration", "strategic planning", "customer service",
    "unit testing", "qa", "cypress", "jest", "selenium", "devops", "system design", "architecture",
    
    # Design, Marketing & Finance
    "figma", "adobe xd", "ui/ux", "graphic design", "photoshop", "illustrator", "seo", "digital marketing",
    "financial analysis", "accounting", "risk management", "business analysis"
]

def extract_skills_nlp(text: str) -> list:
    text_lower = text.lower()
    found_skills = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill.title())
    return sorted(list(set(found_skills)))

def validate_resume_context(text: str) -> tuple[bool, str]:
    if not text or not text.strip():
        return False, "Document rejected: Missing content or empty text file."
        
    words = text.strip().split()
    if len(words) < 15:
        return False, "Document rejected: Missing resume context. Insufficient content length (minimum 15 words required)."

    text_lower = text.lower()
    
    # Core resume structural signals
    resume_keywords = [
        "experience", "work", "education", "skills", "projects", "profile", "summary",
        "university", "college", "bachelor", "master", "phd", "degree", "diploma",
        "developer", "engineer", "analyst", "manager", "designer", "consultant",
        "specialist", "administrator", "coordinator", "lead", "intern", "associate",
        "employment", "responsibilities", "achievements", "certificat", "contact",
        "phone", "email", "linkedin", "github", "curriculum", "vitae", "resume"
    ]
    
    matched_keywords = sum(1 for kw in resume_keywords if kw in text_lower)
    found_skills = extract_skills_nlp(text)
    
    if matched_keywords < 1 and len(found_skills) == 0:
        return False, "Document rejected: Missing resume context. Uploaded file does not contain valid career experience, skills, or professional background."

    return True, ""

def evaluate_resume(text: str):
    skills = extract_skills_nlp(text)
    length = len(text.split())
    
    # 1. Skill Score (Max 40 points) - 5+ skills give full points
    skill_score = min(len(skills) * 8, 40)
    
    # 2. Adaptive Length Score (Max 30 points) - Accepts concise (100+) & detailed (1200) resumes
    if 100 <= length <= 1200:
        length_score = 30
    elif 50 <= length < 100 or 1200 < length <= 1500:
        length_score = 20
    else:
        length_score = 10
    
    # 3. Dynamic Section Coverage Score (Max 30 points)
    text_lower = text.lower()
    has_experience = any(kw in text_lower for kw in [
        "experience", "work", "employment", "history", "projects", "roles", "responsibilities", "accomplishments"
    ])
    has_education = any(kw in text_lower for kw in [
        "education", "degree", "university", "college", "bachelor", "master", "phd", "diploma", "qualification", "certification"
    ])
    has_contact = "@" in text or any(char.isdigit() for char in text) or any(kw in text_lower for kw in ["phone", "email", "linkedin", "github"])
    
    section_score = (10 if has_experience else 0) + (10 if has_education else 0) + (10 if has_contact else 0)
    
    # Overall ATS Score Computation
    overall_score = min(round(skill_score + length_score + section_score), 100)
    
    return {
        "score": overall_score,
        "skills": skills,
        "word_count": length,
        "has_experience": has_experience,
        "has_education": has_education,
        "has_contact": has_contact
    }


def match_job_description(resume_text: str, job_text: str):
    resume_skills = set([s.lower() for s in extract_skills_nlp(resume_text)])
    job_skills = set([s.lower() for s in extract_skills_nlp(job_text)])
    
    if not job_skills:
        # Match general words if no specific technical skills are detected in job text
        job_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', job_text.lower()))
        matched_set = set([s for s in resume_skills if s in job_words])
        missing_set = set()
        matched = sorted([s.title() for s in matched_set])
        missing = []
        match_score = min(round((len(matched_set) / max(len(resume_skills), 1)) * 100, 1), 85.0) if resume_skills else 50.0
    else:
        matched_set = resume_skills.intersection(job_skills)
        missing_set = job_skills - resume_skills
        matched = sorted([s.title() for s in matched_set])
        missing = sorted([s.title() for s in missing_set])
        match_score = min(round((len(matched_set) / len(job_skills)) * 100, 1), 98.0)
        
    return {
        "match_score": max(match_score, 10.0),
        "matched_skills": matched,
        "missing_skills": missing,
        "keyword_coverage": min(round(match_score + 2.0, 1), 99.0)
    }

def format_transcript_text(transcript: str) -> str:
    if not transcript or not transcript.strip():
        return ""
    
    # Standardize spaces and clean up
    clean_text = re.sub(r'\s+', ' ', transcript.strip())
    
    # Capitalize sentences and add punctuation after natural sentence pauses
    sentences = re.split(r'(?<=[.!?])\s+', clean_text)
    formatted_sentences = []
    
    for s in sentences:
        s = s.strip()
        if s:
            s = s[0].upper() + (s[1:] if len(s) > 1 else "")
            if not s.endswith(('.', '!', '?')):
                s += '.'
            formatted_sentences.append(s)
            
    return "\n".join(formatted_sentences)

FILLER_WORDS = ["um", "uh", "like", "you know", "actually", "basically", "literally", "sort of", "kind of"]

def analyze_speech_transcript(transcript: str, duration_sec: float = 45.0):
    formatted_transcript = format_transcript_text(transcript)
    words = re.findall(r'\w+', transcript.lower())
    word_count = len(words)
    wpm = round((word_count / max(duration_sec, 1.0)) * 60, 1) if duration_sec > 0 else 130.0
    
    filler_count = sum(transcript.lower().count(fw) for fw in FILLER_WORDS)
    
    # Sentiment heuristics
    positives = ["achieved", "improved", "developed", "led", "solved", "created", "success", "effective", "great", "built"]
    negatives = ["failed", "stuck", "hard", "problem", "cannot", "issue", "difficult", "bad"]
    
    pos_score = sum(1 for w in words if w in positives)
    neg_score = sum(1 for w in words if w in negatives)
    
    if pos_score > neg_score:
        sentiment = "Positive"
    elif neg_score > pos_score:
        sentiment = "Needs Improvement"
    else:
        sentiment = "Neutral"

    # Score calculation
    clarity = max(100 - (filler_count * 5), 50)
    wpm_score = 90 if 110 <= wpm <= 160 else 70
    overall_score = round((clarity * 0.5) + (wpm_score * 0.3) + (85 * 0.2))

    recs = []
    if filler_count > 2:
        recs.append(f"Reduce filler words like '{FILLER_WORDS[0]}' and 'like' (detected {filler_count} times).")
    if wpm < 110:
        recs.append("Try pacing your answers slightly faster to express confidence.")
    elif wpm > 160:
        recs.append("Slow down your speaking pace slightly for clearer articulation.")
    recs.append("Include more specific metrics and quantitative achievements in your interview responses.")

    return {
        "transcript": formatted_transcript or transcript,
        "word_count": word_count,
        "words_per_minute": wpm if wpm > 0 else 125.0,
        "filler_word_count": filler_count,
        "sentiment": sentiment,
        "score": overall_score,
        "recommendations": recs
    }
