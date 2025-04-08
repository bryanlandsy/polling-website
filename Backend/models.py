from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base
from datetime import datetime

class PollResponse(Base):
    __tablename__ = "poll_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    poll_type = Column(String, index=True)  # e.g., "pre" or "post"
    answers = Column(JSON)  # Store poll answers as a JSON object
    timestamp = Column(DateTime, default=datetime.utcnow)
