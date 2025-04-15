from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import models, crud, database
from database import SessionLocal, engine
from pydantic import BaseModel
from typing import Dict, List, Optional, Union, Any
from collections import Counter
import statistics
import json
from sqlalchemy import func
import re
import string

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware with very permissive settings for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom middleware to add CORS headers as a fallback
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    return response

# Add OPTIONS handler for each route to properly handle CORS preflight requests
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    response = JSONResponse(content={"message": "OK"})
    return response

# Add a root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Polling Website API",
        "endpoints": [
            {"path": "/poll", "methods": ["GET", "POST"], "description": "Get poll questions or submit poll answers"},
            {"path": "/analytics", "methods": ["GET"], "description": "Get analytics for poll responses"}
        ]
    }

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for poll answers
class PollAnswers(BaseModel):
    poll_type: str  # "pre" or "post"
    answers: Dict[str, Any]  # Dictionary of answers (question_id: answer), can be string or list

# Helper functions for analytics
def analyze_rating_question(responses, question_id):
    """Analyze rating question responses"""
    values = [int(resp.get(question_id, 0)) for resp in responses if question_id in resp]
    if not values:
        return {
            "count": 0,
            "mean": 0,
            "distribution": {1: 0, 2: 0, 3: 0, 4: 0}
        }
    
    # Count distribution
    distribution = Counter(values)
    for i in range(1, 5):  # Ensure all values 1-4 have counts
        if i not in distribution:
            distribution[i] = 0
    
    return {
        "count": len(values),
        "mean": round(statistics.mean(values), 2) if values else 0,
        "median": statistics.median(values) if values else 0,
        "distribution": dict(sorted(distribution.items()))
    }

def analyze_checkbox_question(responses, question_id):
    """Analyze checkbox question responses"""
    all_selections = []
    for resp in responses:
        if question_id in resp:
            # Handle comma-separated values from checkbox groups
            selections = resp[question_id].split(", ") if isinstance(resp[question_id], str) else [resp[question_id]]
            all_selections.extend(selections)
    
    counter = Counter(all_selections)
    return {
        "count": len(responses),
        "selections": dict(counter.most_common()),
        "top_selections": dict(counter.most_common(3))
    }

def analyze_text_question(responses, question_id):
    """Enhanced analysis for text responses including keyword extraction"""
    texts = [resp.get(question_id, "") for resp in responses if question_id in resp and resp[question_id]]
    
    # Basic statistics
    basic_stats = {
        "count": len(texts),
        "response_rate": round(len(texts) / len(responses) * 100, 2) if responses else 0,
        "average_length": round(sum(len(t) for t in texts) / len(texts), 2) if texts else 0
    }
    
    # Extract keywords for word bubble visualization
    keywords = extract_keywords_from_texts(texts)
    
    return {
        **basic_stats,
        "keywords": keywords
    }

def extract_keywords_from_texts(texts):
    """Extract keywords from text responses and count their frequencies"""
    # List of common English stopwords (determiners, prepositions, verbs, etc.) to exclude
    stopwords = {'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
                 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
                 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
                 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
                 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
                 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
                 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now',
                 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
                 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven',
                 "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn',
                 "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't",
                 'won', "won't", 'wouldn', "wouldn't", 'be', 'been', 'is', 'am', 'are', 'was', 'were', 
                 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'that', 'this', 
                 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 
                 "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 
                 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 
                 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 
                 'would', 'could', 'should'}

    # Process text and count keywords
    all_words = []
    for text in texts:
        # Convert to lowercase and replace punctuation with spaces
        text = text.lower()
        for p in string.punctuation:
            text = text.replace(p, ' ')
            
        # Split into words and filter out stopwords and single characters
        words = [word for word in text.split() if word not in stopwords and len(word) > 1]
        all_words.extend(words)
    
    # Count word frequencies and get the top 50 words for the bubble chart
    word_counts = Counter(all_words)
    top_words = word_counts.most_common(50)  # Limit to top 50 words
    
    # Format for the frontend
    return [{"text": word, "value": count} for word, count in top_words]

def calculate_differential(pre_stats, post_stats, question_type):
    """Calculate differential statistics between pre and post polls"""
    if question_type == "rating":
        if pre_stats["count"] == 0 or post_stats["count"] == 0:
            return {"mean_change": 0, "distribution_change": {}}
        
        mean_change = round(post_stats["mean"] - pre_stats["mean"], 2)
        distribution_change = {
            k: post_stats["distribution"].get(k, 0) - pre_stats["distribution"].get(k, 0)
            for k in set(pre_stats["distribution"]).union(post_stats["distribution"])
        }
        
        return {
            "mean_change": mean_change,
            "distribution_change": distribution_change
        }
    
    elif question_type == "checkbox":
        if not pre_stats["selections"] or not post_stats["selections"]:
            return {"selection_changes": {}}
        
        selection_changes = {
            k: post_stats["selections"].get(k, 0) - pre_stats["selections"].get(k, 0)
            for k in set(pre_stats["selections"]).union(post_stats["selections"])
        }
        
        # Sort by absolute change to highlight biggest shifts
        sorted_changes = dict(sorted(
            selection_changes.items(), 
            key=lambda x: abs(x[1]), 
            reverse=True
        ))
        
        return {
            "selection_changes": sorted_changes
        }
    
    return {}

@app.get("/poll")
def get_poll():
    # Gen Z Mental Health poll questions
    poll_questions = {
        "title": "Gen Z Mental Health Poll",
        "description": "For the following questions rate how much you agree or disagree with each item.",
        "scale_description": "1 - Strongly Disagree, 2 - Disagree, 3 - Agree, 4 - Strongly Agree",
        "questions": [
            {
                "id": "q1", 
                "question": "There is a mental health crisis among Gen Z. (Gen Z is the generation of people born between 1997-2012).",
                "type": "rating",
                "required": True,
                "min": 1,
                "max": 4,
                "labels": ["Strongly Disagree", "Strongly Agree"]
            },
            {
                "id": "q2", 
                "question": "Frequent social media use negatively affects mental health.",
                "type": "rating",
                "required": True,
                "min": 1,
                "max": 4,
                "labels": ["Strongly Disagree", "Strongly Agree"]
            },
            {
                "id": "q3", 
                "question": "Mental health is worse for Gen Z than previous generations.",
                "type": "rating",
                "required": True,
                "min": 1,
                "max": 4,
                "labels": ["Strongly Disagree", "Strongly Agree"]
            },
            {
                "id": "q4", 
                "question": "What do you think are the biggest causes of mental heath problems among Gen Z (please choose your top 3).",
                "type": "checkbox",
                "required": True,
                "options": [
                    "less opportunity for risky play",
                    "decline of interest in religion/religious communities",
                    "devices: smartphones/video games",
                    "less face to face interaction/less community spaces for kids to gather together",
                    "impact of Covid-19 pandemic",
                    "lack of physical activity",
                    "gun violence/threat of mass shootings",
                    "self-pathologizing/self-diagnosing",
                    "social media: echo-chambers online that reinforce belief systems/toxic positivity/cyberbullying",
                    "rise in deviant behaviors such as substance abuse/gambling",
                    "economic concerns",
                    "climate change concerns"
                ]
            },
            {
                "id": "q5", 
                "question": "If you believe there is a Gen Z mental health crisis, what suggestions/solutions would you recommend?",
                "type": "text",
                "required": False
            }
        ]
    }
    return poll_questions

@app.post("/poll")
def submit_poll(poll: PollAnswers, db: Session = Depends(get_db)):
    response = crud.create_poll_response(db, poll.poll_type, poll.answers)
    return {"status": "success", "response_id": response.id}

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    # Basic counts of responses for each poll type
    pre_count = db.query(models.PollResponse).filter(models.PollResponse.poll_type == "pre").count()
    post_count = db.query(models.PollResponse).filter(models.PollResponse.poll_type == "post").count()
    
    # Fetch all responses
    pre_responses = db.query(models.PollResponse).filter(models.PollResponse.poll_type == "pre").all()
    post_responses = db.query(models.PollResponse).filter(models.PollResponse.poll_type == "post").all()
    
    # Extract answer dictionaries
    pre_answers = [json.loads(json.dumps(r.answers)) for r in pre_responses]
    post_answers = [json.loads(json.dumps(r.answers)) for r in post_responses]
    
    # Analyze each question
    analytics = {
        "summary": {
            "pre_poll_count": pre_count,
            "post_poll_count": post_count,
            "total_responses": pre_count + post_count
        },
        "questions": {}
    }
    
    # Rating questions (q1, q2, q3)
    for q_id in ["q1", "q2", "q3"]:
        pre_stats = analyze_rating_question(pre_answers, q_id)
        post_stats = analyze_rating_question(post_answers, q_id)
        differential = calculate_differential(pre_stats, post_stats, "rating")
        
        analytics["questions"][q_id] = {
            "pre_poll": pre_stats,
            "post_poll": post_stats,
            "differential": differential
        }
    
    # Checkbox question (q4)
    pre_checkbox = analyze_checkbox_question(pre_answers, "q4")
    post_checkbox = analyze_checkbox_question(post_answers, "q4")
    checkbox_diff = calculate_differential(pre_checkbox, post_checkbox, "checkbox")
    
    analytics["questions"]["q4"] = {
        "pre_poll": pre_checkbox,
        "post_poll": post_checkbox,
        "differential": checkbox_diff
    }
    
    # Text question (q5)
    pre_text = analyze_text_question(pre_answers, "q5")
    post_text = analyze_text_question(post_answers, "q5")
    
    analytics["questions"]["q5"] = {
        "pre_poll": pre_text,
        "post_poll": post_text,
        "differential": {
            "response_rate_change": round(post_text["response_rate"] - pre_text["response_rate"], 2),
            "avg_length_change": round(post_text["average_length"] - pre_text["average_length"], 2)
        }
    }
    
    # Add question metadata for reference
    poll_data = get_poll()
    question_lookup = {q["id"]: q for q in poll_data["questions"]}
    
    for q_id, stats in analytics["questions"].items():
        if q_id in question_lookup:
            stats["question_text"] = question_lookup[q_id]["question"]
            stats["question_type"] = question_lookup[q_id]["type"]
    
    return analytics