from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re
import PyPDF2

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# LOAD NLP MODEL
# ---------------------------------------------------------

nlp = spacy.load("en_core_web_sm")


# ---------------------------------------------------------
# COMMON SKILLS
# ---------------------------------------------------------

SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "node.js",
    "express.js",
    "next.js",
    "html",
    "css",
    "tailwind css",
    "bootstrap",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "firebase",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "power bi",
    "tableau",
    "excel",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "generative ai",
    "natural language processing",
    "data analysis",
    "data science",
    "flutter",
    "dart",
    "rest api",
    "apis",
    "full stack",
    "object oriented programming",
    "visual studio code"
}


# ---------------------------------------------------------
# SKILL SYNONYMS
# ---------------------------------------------------------

SKILL_SYNONYMS = {
    "js": "javascript",
    "javascript": "javascript",

    "ts": "typescript",
    "typescript": "typescript",

    "reactjs": "react",
    "react.js": "react",
    "react js": "react",

    "nodejs": "node.js",
    "node js": "node.js",
    "node.js": "node.js",

    "expressjs": "express.js",
    "express js": "express.js",
    "express.js": "express.js",

    "nextjs": "next.js",
    "next js": "next.js",
    "next.js": "next.js",

    "postgres": "postgresql",
    "postgresql": "postgresql",

    "mongo": "mongodb",
    "mongodb": "mongodb",

    "ml": "machine learning",
    "machine learning": "machine learning",

    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",

    "gen ai": "generative ai",
    "genai": "generative ai",
    "generative ai": "generative ai",

    "nlp": "natural language processing",
    "natural language processing": "natural language processing",

    "dl": "deep learning",
    "deep learning": "deep learning",

    "powerbi": "power bi",
    "power bi": "power bi",

    "tailwindcss": "tailwind css",
    "tailwind css": "tailwind css",

    "restful api": "rest api",
    "restful apis": "rest api",
    "rest api": "rest api",

    "fullstack": "full stack",
    "full-stack": "full stack",
    "full stack": "full stack",

    "oop": "object oriented programming",
    "object oriented programming": "object oriented programming",

    "vscode": "visual studio code",
    "visual studio code": "visual studio code",

    "github": "github",
    "git": "git"
}


# ---------------------------------------------------------
# KEYWORD STOPWORDS
# ---------------------------------------------------------

KEYWORD_STOPWORDS = {
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "a",
    "an",
    "is",
    "are",
    "be",
    "as",
    "by",
    "at",
    "from",
    "this",
    "that",
    "will",
    "we",
    "you",
    "your",
    "our",
    "their",
    "have",
    "has",
    "using",
    "used",
    "work",
    "working",
    "experience",
    "role",
    "job",
    "candidate",
    "team",
    "strong",
    "good",
    "skills",
    "ability",
    "knowledge"
}


# ---------------------------------------------------------
# PDF TEXT EXTRACTION
# ---------------------------------------------------------

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


# ---------------------------------------------------------
# TEXT PREPROCESSING
# ---------------------------------------------------------

def preprocess(text):
    doc = nlp(text.lower())

    tokens = []

    for token in doc:
        if (
            not token.is_stop
            and token.is_alpha
            and len(token.text) > 2
        ):
            tokens.append(token.lemma_)

    return " ".join(tokens)


# ---------------------------------------------------------
# NORMALIZE TEXT
# ---------------------------------------------------------

def normalize_text(text):
    text = text.lower()

    for original, normalized in sorted(
        SKILL_SYNONYMS.items(),
        key=lambda x: len(x[0]),
        reverse=True
    ):
        text = re.sub(
            r"\b" + re.escape(original) + r"\b",
            normalized,
            text
        )

    return text


# ---------------------------------------------------------
# SKILL EXTRACTION
# ---------------------------------------------------------

def extract_skills(text):
    normalized = normalize_text(text)

    found = set()

    for skill in SKILLS:
        if re.search(
            r"\b" + re.escape(skill) + r"\b",
            normalized
        ):
            found.add(skill)

    return found


# ---------------------------------------------------------
# TEXT SIMILARITY
# ---------------------------------------------------------

def calculate_text_similarity(resume_text, job_description):

    resume_processed = preprocess(resume_text)
    job_processed = preprocess(job_description)

    if not resume_processed or not job_processed:
        return 0

    vectorizer = TfidfVectorizer()

    vectors = vectorizer.fit_transform(
        [resume_processed, job_processed]
    )

    similarity = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    return round(similarity * 100, 2)


# ---------------------------------------------------------
# SKILL MATCH
# ---------------------------------------------------------

def calculate_skill_match(resume_text, job_description):

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    if not job_skills:
        return 0

    matched = resume_skills.intersection(job_skills)

    score = (
        len(matched) / len(job_skills)
    ) * 100

    return round(score, 2)


# ---------------------------------------------------------
# KEYWORD EXTRACTION
# ---------------------------------------------------------

def extract_keywords(text):

    normalized = normalize_text(text)

    words = re.findall(
        r"\b[a-zA-Z][a-zA-Z0-9+#.-]{2,}\b",
        normalized.lower()
    )

    keywords = []

    for word in words:

        clean_word = word.strip(".,;:!?()[]{}")

        if (
            clean_word
            and clean_word not in KEYWORD_STOPWORDS
            and len(clean_word) > 2
        ):
            keywords.append(clean_word)

    # Preserve order while removing duplicates
    unique_keywords = list(dict.fromkeys(keywords))

    return unique_keywords


# ---------------------------------------------------------
# KEYWORD MATCH
# ---------------------------------------------------------

def calculate_keyword_match(resume_text, job_description):

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    job_keywords = set(
        extract_keywords(job_description)
    )

    if not job_keywords:
        return 0

    matched = resume_keywords.intersection(
        job_keywords
    )

    score = (
        len(matched) / len(job_keywords)
    ) * 100

    return round(score, 2)


# ---------------------------------------------------------
# CONTENT RELEVANCE
# ---------------------------------------------------------

def calculate_content_relevance(
    resume_text,
    job_description
):

    resume_words = set(
        extract_keywords(resume_text)
    )

    job_words = set(
        extract_keywords(job_description)
    )

    if not job_words:
        return 0

    relevant_words = resume_words.intersection(
        job_words
    )

    score = (
        len(relevant_words) /
        len(job_words)
    ) * 100

    return round(score, 2)


# ---------------------------------------------------------
# SMART ATS SCORE
# ---------------------------------------------------------

def calculate_smart_score(
    text_similarity,
    skill_match,
    keyword_match,
    content_relevance
):

    score = (
        text_similarity * 0.40
        + skill_match * 0.30
        + keyword_match * 0.20
        + content_relevance * 0.10
    )

    return round(
        max(0, min(score, 100)),
        2
    )


# ---------------------------------------------------------
# MATCHING SKILLS
# ---------------------------------------------------------

def find_matching_skills(
    resume_text,
    job_description
):

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    return sorted(
        resume_skills.intersection(job_skills)
    )


# ---------------------------------------------------------
# MISSING SKILLS
# ---------------------------------------------------------

def find_missing_skills(
    resume_text,
    job_description
):

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    return sorted(
        job_skills - resume_skills
    )


# ---------------------------------------------------------
# MATCHING KEYWORDS
# ---------------------------------------------------------

def find_matching_keywords(
    resume_text,
    job_description
):

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    job_keywords = set(
        extract_keywords(job_description)
    )

    return sorted(
        resume_keywords.intersection(
            job_keywords
        )
    )


# ---------------------------------------------------------
# MISSING KEYWORDS
# ---------------------------------------------------------

def find_missing_keywords(
    resume_text,
    job_description
):

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    job_keywords = set(
        extract_keywords(job_description)
    )

    return sorted(
        job_keywords - resume_keywords
    )


# ---------------------------------------------------------
# KEYWORD HIGHLIGHTING
# ---------------------------------------------------------

def create_keyword_highlights(
    text,
    matched_keywords,
    missing_keywords
):

    matched_set = {
        normalize_text(k).lower()
        for k in matched_keywords
    }

    missing_set = {
        normalize_text(k).lower()
        for k in missing_keywords
    }

    pattern_words = sorted(
        matched_set.union(missing_set),
        key=len,
        reverse=True
    )

    if not pattern_words:
        return [
            {
                "text": text,
                "type": "normal"
            }
        ]

    pattern = re.compile(
        r"\b(" +
        "|".join(
            re.escape(word)
            for word in pattern_words
        ) +
        r")\b",
        re.IGNORECASE
    )

    highlights = []

    last_index = 0

    for match in pattern.finditer(text):

        if match.start() > last_index:

            highlights.append({
                "text": text[
                    last_index:match.start()
                ],
                "type": "normal"
            })

        matched_word = normalize_text(
            match.group(0)
        ).lower()

        if matched_word in matched_set:
            highlight_type = "matched"

        elif matched_word in missing_set:
            highlight_type = "missing"

        else:
            highlight_type = "normal"

        highlights.append({
            "text": match.group(0),
            "type": highlight_type
        })

        last_index = match.end()

    if last_index < len(text):

        highlights.append({
            "text": text[last_index:],
            "type": "normal"
        })

    return highlights


# ---------------------------------------------------------
# RESUME STRENGTHS
# ---------------------------------------------------------

def generate_strengths(
    resume_text,
    job_description
):

    strengths = []

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    matching = resume_skills.intersection(
        job_skills
    )

    if matching:
        strengths.append(
            "Your resume contains "
            + str(len(matching))
            + " skills that match the job requirements."
        )

    if len(resume_text.split()) > 250:
        strengths.append(
            "Your resume contains detailed professional content."
        )

    if re.search(
        r"\b(project|projects)\b",
        resume_text,
        re.IGNORECASE
    ):
        strengths.append(
            "Your resume includes project experience."
        )

    if re.search(
        r"\b(internship|intern|experience)\b",
        resume_text,
        re.IGNORECASE
    ):
        strengths.append(
            "Your resume includes practical experience."
        )

    if not strengths:
        strengths.append(
            "Your resume provides a foundation for improving ATS compatibility."
        )

    return strengths


# ---------------------------------------------------------
# RESUME IMPROVEMENTS
# ---------------------------------------------------------

def generate_resume_improvements(
    resume_text,
    job_description
):

    improvements = []

    missing_skills = find_missing_skills(
        resume_text,
        job_description
    )

    if missing_skills:

        improvements.append(
            "Consider adding relevant skills such as "
            + ", ".join(missing_skills[:6])
            + " if you genuinely have experience with them."
        )

    if len(resume_text.split()) < 250:

        improvements.append(
            "Consider adding measurable project achievements and technical details."
        )

    if not re.search(
        r"\b(project|projects)\b",
        resume_text,
        re.IGNORECASE
    ):

        improvements.append(
            "Add relevant academic or personal projects."
        )

    return improvements


# ---------------------------------------------------------
# PROJECT IMPROVEMENTS
# ---------------------------------------------------------

def generate_project_improvements(
    resume_text,
    job_description
):

    suggestions = []

    if re.search(
        r"\b(project|projects)\b",
        resume_text,
        re.IGNORECASE
    ):

        suggestions.append(
            "Highlight the technologies used in each project."
        )

        suggestions.append(
            "Add measurable outcomes, features, or results where possible."
        )

    else:

        suggestions.append(
            "Add projects that demonstrate the skills required by the job."
        )

    return suggestions


# ---------------------------------------------------------
# RECOMMENDATIONS
# ---------------------------------------------------------

def generate_recommendations(
    score,
    missing_skills,
    missing_keywords
):

    recommendations = []

    if score < 60:

        recommendations.append(
            "Improve keyword alignment between your resume and the job description."
        )

    if missing_skills:

        recommendations.append(
            "Add relevant missing skills only when they accurately represent your experience."
        )

    if missing_keywords:

        recommendations.append(
            "Use important job-specific terminology naturally in relevant resume sections."
        )

    if score >= 80:

        recommendations.append(
            "Your resume has strong alignment with the provided job description."
        )

    return recommendations


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "ATS Resume Matcher API is running successfully."
    })


# ---------------------------------------------------------
# MATCH API
# ---------------------------------------------------------

@app.route("/match", methods=["POST"])
def match_resume():

    try:

        if "resume" not in request.files:

            return jsonify({
                "success": False,
                "error": "Resume PDF is required."
            }), 400

        resume_file = request.files["resume"]

        job_description = request.form.get(
            "jobDescription",
            ""
        )

        if not job_description.strip():

            return jsonify({
                "success": False,
                "error": "Job description is required."
            }), 400

        resume_text = extract_text_from_pdf(
            resume_file
        )

        text_similarity = calculate_text_similarity(
            resume_text,
            job_description
        )

        skill_match = calculate_skill_match(
            resume_text,
            job_description
        )

        keyword_match = calculate_keyword_match(
            resume_text,
            job_description
        )

        content_relevance = calculate_content_relevance(
            resume_text,
            job_description
        )

        score = calculate_smart_score(
            text_similarity,
            skill_match,
            keyword_match,
            content_relevance
        )

        return jsonify({

            "success": True,

            "score": score,

            "breakdown": {

                "textSimilarity": text_similarity,

                "skillMatch": skill_match,

                "keywordMatch": keyword_match,

                "contentRelevance": content_relevance

            },

            "message":
                "Resume has been analyzed successfully."

        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------------------------------------------------
# ANALYZE API
# ---------------------------------------------------------

@app.route("/analyze", methods=["POST"])
def analyze_resume():

    try:

        if "resume" not in request.files:

            return jsonify({
                "success": False,
                "error": "Resume PDF is required."
            }), 400

        resume_file = request.files["resume"]

        job_description = request.form.get(
            "jobDescription",
            ""
        )

        if not job_description.strip():

            return jsonify({
                "success": False,
                "error": "Job description is required."
            }), 400

        resume_text = extract_text_from_pdf(
            resume_file
        )

        # Scores
        text_similarity = calculate_text_similarity(
            resume_text,
            job_description
        )

        skill_match = calculate_skill_match(
            resume_text,
            job_description
        )

        keyword_match = calculate_keyword_match(
            resume_text,
            job_description
        )

        content_relevance = calculate_content_relevance(
            resume_text,
            job_description
        )

        score = calculate_smart_score(
            text_similarity,
            skill_match,
            keyword_match,
            content_relevance
        )

        # Skills
        matching_skills = find_matching_skills(
            resume_text,
            job_description
        )

        missing_skills = find_missing_skills(
            resume_text,
            job_description
        )

        # Keywords
        matching_keywords = find_matching_keywords(
            resume_text,
            job_description
        )

        missing_keywords = find_missing_keywords(
            resume_text,
            job_description
        )

        important_keywords = (
            extract_keywords(job_description)[:20]
        )

        # Highlights
        resume_highlights = create_keyword_highlights(
            resume_text,
            matching_keywords,
            []
        )

        job_highlights = create_keyword_highlights(
            job_description,
            matching_keywords,
            missing_keywords
        )

        # Insights
        strengths = generate_strengths(
            resume_text,
            job_description
        )

        resume_improvements = generate_resume_improvements(
            resume_text,
            job_description
        )

        project_improvements = generate_project_improvements(
            resume_text,
            job_description
        )

        recommendations = generate_recommendations(
            score,
            missing_skills,
            missing_keywords
        )

        analysis = f"""
1. Resume Strengths

{chr(10).join("- " + item for item in strengths)}

2. Matching Skills

{chr(10).join("- " + item for item in matching_skills) if matching_skills else "- No strong matching skills detected."}

3. Missing Skills

{chr(10).join("- " + item for item in missing_skills) if missing_skills else "- No major missing skills detected."}

4. Missing Keywords

{chr(10).join("- " + item for item in missing_keywords[:15]) if missing_keywords else "- No major missing keywords detected."}

5. Resume Improvements

{chr(10).join("- " + item for item in resume_improvements) if resume_improvements else "- Your resume structure is reasonably aligned."}

6. Project Improvements

{chr(10).join("- " + item for item in project_improvements)}

7. Final Recommendations

{chr(10).join("- " + item for item in recommendations)}

Note:
This analysis uses local NLP, keyword extraction, skill matching and text similarity. It does not use an external generative AI service.
"""

        return jsonify({

            "success": True,

            "analysis": analysis,

            "score": score,

            "breakdown": {

                "textSimilarity": text_similarity,

                "skillMatch": skill_match,

                "keywordMatch": keyword_match,

                "contentRelevance": content_relevance

            },

            "keywords": {

                "matched": matching_keywords,

                "missing": missing_keywords,

                "important": important_keywords

            },

            "skills": {

                "matched": matching_skills,

                "missing": missing_skills

            },

            "keywordHighlights": {

                "resume": resume_highlights,

                "jobDescription": job_highlights

            }

        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )