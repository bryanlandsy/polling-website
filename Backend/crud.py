from sqlalchemy.orm import Session
from models import PollResponse

def create_poll_response(db: Session, poll_type: str, answers: dict):
    db_response = PollResponse(poll_type=poll_type, answers=answers)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response
