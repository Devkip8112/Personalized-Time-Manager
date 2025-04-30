from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import database, crud

def create_sample_tasks(db: Session):
    # Get current time for reference
    now = datetime.now()
    
    sample_tasks = [
        {
            "title": "Morning Team Standup",
            "description": "Daily team sync to discuss progress and blockers",
            "due_date": (now + timedelta(days=1)).replace(hour=9, minute=30),
            "estimated_duration": 30,
            "energy_level": "high"
        },
        {
            "title": "Project Planning Session",
            "description": "Quarterly planning meeting with stakeholders",
            "due_date": (now + timedelta(days=1)).replace(hour=11, minute=0),
            "estimated_duration": 90,
            "energy_level": "high"
        },
        {
            "title": "Code Review",
            "description": "Review pull requests from the team",
            "due_date": (now + timedelta(days=1)).replace(hour=14, minute=0),
            "estimated_duration": 45,
            "energy_level": "medium"
        },
        {
            "title": "Documentation Update",
            "description": "Update API documentation with recent changes",
            "due_date": (now + timedelta(days=2)).replace(hour=10, minute=0),
            "estimated_duration": 60,
            "energy_level": "medium"
        },
        {
            "title": "Email Catch-up",
            "description": "Process inbox and respond to important messages",
            "due_date": (now + timedelta(days=2)).replace(hour=16, minute=0),
            "estimated_duration": 30,
            "energy_level": "low"
        },
        {
            "title": "Weekly Report",
            "description": "Prepare weekly progress report for management",
            "due_date": (now + timedelta(days=3)).replace(hour=15, minute=0),
            "estimated_duration": 45,
            "energy_level": "medium"
        }
    ]
    
    # Add each task to the database
    for task_data in sample_tasks:
        crud.create_task(db, task_data)
    
    return len(sample_tasks)

def main():
    # Create tables
    database.Base.metadata.create_all(bind=database.engine)
    
    # Create a new database session
    db = database.SessionLocal()
    try:
        # Add sample tasks
        num_tasks = create_sample_tasks(db)
        print(f"Successfully added {num_tasks} sample tasks to the database.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
