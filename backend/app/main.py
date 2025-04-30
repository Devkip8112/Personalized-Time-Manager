from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from . import crud, database
from .database import SessionLocal, engine, DBTask

app = FastAPI(title="AI Time Manager")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    estimated_duration: int  # in minutes
    energy_level: str  # low, medium, high

    class Config:
        orm_mode = True

class TaskCreate(Task):
    pass

class TaskResponse(Task):
    id: int
    created_at: datetime
    completed: int

    class Config:
        orm_mode = True

class ScheduleSuggestion(BaseModel):
    task_title: str
    suggested_time: datetime
    reason: str

class TimeUpdate(BaseModel):
    suggested_time: str

def is_time_slot_available(suggested_time: datetime, duration: int, scheduled_slots: List[tuple]) -> bool:
    task_end_time = suggested_time + timedelta(minutes=duration)
    
    for slot_start, slot_end in scheduled_slots:
        # Check if there's any overlap with existing slots
        if not (task_end_time <= slot_start or suggested_time >= slot_end):
            return False
    return True

def find_next_available_slot(base_time: datetime, duration: int, scheduled_slots: List[tuple]) -> datetime:
    current_time = base_time
    while not is_time_slot_available(current_time, duration, scheduled_slots):
        current_time += timedelta(minutes=30)  # Try 30-minute increments
    return current_time

@app.get("/")
async def root():
    return {"message": "Welcome to AI Time Manager API"}

@app.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(database.get_db)):
    return crud.create_task(db, task.dict())

@app.get("/tasks/", response_model=List[TaskResponse])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskResponse)
def read_task(task_id: int, db: Session = Depends(database.get_db)):
    db_task = crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskCreate, db: Session = Depends(database.get_db)):
    db_task = crud.update_task(db, task_id, task.dict())
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.post("/analyze")
async def analyze_schedule(request: Request):
    try:
        data = await request.json()
        tasks = data.get("tasks", [])
        
        # Simple analysis logic (you can make this more sophisticated)
        suggestions = []
        for task in tasks:
            if not task.get("completed"):
                # Example: Suggest moving tasks to earlier in the day
                current_due = datetime.fromisoformat(task["due_date"].replace("Z", "+00:00"))
                suggested_time = current_due - timedelta(hours=2)
                
                suggestions.append({
                    "task_id": task["id"],
                    "task_title": task["title"],
                    "suggested_time": suggested_time.isoformat(),
                    "reason": f"Consider completing '{task['title']}' earlier to optimize your schedule."
                })
        
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Error in analyze_schedule: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/tasks/{task_id}/update-time")
async def update_task_time(task_id: int, time_update: TimeUpdate, db: Session = Depends(database.get_db)):
    try:
        # Parse the datetime string, handling both formats
        try:
            suggested_time = datetime.fromisoformat(time_update.suggested_time.replace('Z', '+00:00'))
        except ValueError as e:
            print(f"Error parsing date: {e}")
            print(f"Received time string: {time_update.suggested_time}")
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")

        task = db.query(DBTask).filter(DBTask.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task.due_date = suggested_time
        db.commit()
        
        return {"message": "Task time updated successfully", "new_time": suggested_time.isoformat()}
    except Exception as e:
        db.rollback()
        print(f"Error updating task: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@app.post("/tasks/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, db: Session = Depends(database.get_db)):
    db_task = crud.complete_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.post("/optimize-meetings")
async def optimize_meetings(current_schedule: List[Task]):
    # Implementation for meeting optimization
    # This would analyze existing meetings and suggest better times
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
