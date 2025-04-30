# AI-Powered Personal Time Manager

A modern, intelligent task management application that helps you optimize your schedule based on energy levels and productivity patterns. The application features a clean, professional interface with dark mode support and AI-powered scheduling suggestions.

## Features

### Task Management
- Create and manage tasks with titles, descriptions, and due dates
- Assign energy levels (Low, Medium, High) to tasks
- Estimate task duration in minutes
- Mark tasks as complete
- Delete tasks when no longer needed

### AI Schedule Analysis
- Analyze your schedule for optimization opportunities
- Receive intelligent suggestions for task timing
- Consider energy levels when making recommendations
- Apply suggestions with one click
- Smart rescheduling based on productivity patterns

### User Interface
- Clean, modern card-based design
- Dark mode support with smooth transitions
- Responsive layout for all screen sizes
- Professional typography and spacing
- Visual feedback for actions
- Energy level badges
- Elegant animations and transitions

### Technical Features
- Real-time updates
- Persistent data storage
- RESTful API architecture
- Error handling and validation
- Optimized database queries

## Technology Stack

### Frontend
- React with TypeScript
- Modern CSS with CSS Variables
- Responsive design principles
- System-aware dark mode
- Fetch API for data handling

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- Pydantic for validation
- CORS middleware

## Setup

### Backend (Python/FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend (React/TypeScript)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task
- `PUT /tasks/{id}/complete` - Mark a task as complete
- `PUT /tasks/{id}/update-time` - Update task time

### Analysis
- `POST /analyze` - Analyze schedule and get suggestions

## Database Schema

### Tasks Table
- `id` (Integer, Primary Key)
- `title` (String)
- `description` (Text, Optional)
- `due_date` (DateTime)
- `estimated_duration` (Integer, minutes)
- `energy_level` (String: low/medium/high)
- `created_at` (DateTime)
- `completed` (Integer: 0/1)

## Future Enhancements

### Planned Features
1. Task Categories and Tags
2. Calendar View Integration
3. Recurring Tasks
4. Task Dependencies
5. Time Tracking
6. Progress Analytics
7. Task Templates
8. Multi-user Support
9. Mobile Application
10. Advanced AI Analysis

### AI Improvements
1. Learning from User Patterns
2. Personalized Suggestions
3. Energy Level Optimization
4. Meeting Schedule Optimization
5. Break Time Recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI for the efficient backend framework
- React team for the frontend framework
- SQLAlchemy team for the ORM
- All contributors and users of the application
