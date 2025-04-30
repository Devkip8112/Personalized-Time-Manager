from sqlalchemy.orm import Session
from datetime import datetime
from . import database

def create_task(db: Session, task_data: dict):
    db_task = database.DBTask(
        title=task_data["title"],
        description=task_data.get("description"),
        due_date=task_data["due_date"],
        estimated_duration=task_data["estimated_duration"],
        energy_level=task_data["energy_level"],
        created_at=datetime.now()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.DBTask).offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int):
    return db.query(database.DBTask).filter(database.DBTask.id == task_id).first()

def update_task(db: Session, task_id: int, task_data: dict):
    db_task = get_task(db, task_id)
    if db_task:
        for key, value in task_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

def complete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        db_task.completed = 1
        db.commit()
        db.refresh(db_task)
    return db_task
