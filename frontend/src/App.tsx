import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id?: number;
  title: string;
  description?: string;
  due_date: Date;
  estimated_duration: number;
  energy_level: 'low' | 'medium' | 'high';
  created_at?: Date;
  completed?: number;
}

interface ScheduleSuggestion {
  task_id: number;
  task_title: string;
  suggested_time: string;
  reason: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    energy_level: 'medium',
  });
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/tasks/');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.map((task: any) => ({
        ...task,
        due_date: new Date(task.due_date)
      })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.due_date && newTask.estimated_duration) {
      try {
        const response = await fetch('http://localhost:8000/tasks/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newTask,
            due_date: new Date(newTask.due_date).toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }

        const savedTask = await response.json();
        setTasks([...tasks, { ...savedTask, due_date: new Date(savedTask.due_date) }]);
        setNewTask({ energy_level: 'medium' });
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      }
    }
  };

  const handleComplete = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...updatedTask, due_date: new Date(updatedTask.due_date) }
          : task
      ));
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const analyzeSchedule = async () => {
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: tasks }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze schedule');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error analyzing schedule:', error);
    }
  };

  const applySuggestion = async (taskId: number, suggestedTime: string) => {
    if (!taskId) {
      console.error('No task ID provided');
      return;
    }

    try {
      // Format the date string properly
      const formattedTime = new Date(suggestedTime).toISOString();
      console.log('Applying suggestion:', { taskId, suggestedTime: formattedTime });

      const response = await fetch(`http://localhost:8000/tasks/${taskId}/update-time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggested_time: formattedTime }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to apply suggestion');
      }

      console.log('Update successful:', responseData);

      // Update tasks list
      await fetchTasks();
      
      // Remove the applied suggestion
      setSuggestions(prevSuggestions => 
        prevSuggestions.filter(suggestion => suggestion.task_id !== taskId)
      );
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="App">
      <button className="theme-switch" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      <header className="App-header">
        <h1>Personal Time Management</h1>
      </header>
      
      <main className="container">
        <div className="task-form">
          <h2>Create Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Due Date & Time</label>
                <input
                  type="datetime-local"
                  onChange={(e) => setNewTask({...newTask, due_date: new Date(e.target.value)})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={newTask.estimated_duration || ''}
                  onChange={(e) => setNewTask({...newTask, estimated_duration: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Energy Level Required</label>
                <select
                  value={newTask.energy_level}
                  onChange={(e) => setNewTask({...newTask, energy_level: e.target.value as 'low' | 'medium' | 'high'})}
                >
                  <option value="low">Low Energy</option>
                  <option value="medium">Medium Energy</option>
                  <option value="high">High Energy</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Add task details..."
                value={newTask.description || ''}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <button type="submit" className="primary-button">Create Task</button>
          </form>
        </div>

        <div>
          <button onClick={analyzeSchedule} className="analyze-btn">
            Analyze Schedule
          </button>
          
          {suggestions.length > 0 && (
            <div className="suggestions">
              <h3>Schedule Analysis</h3>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <strong>{suggestion.task_title}</strong>
                  <div>Suggested Time: {new Date(suggestion.suggested_time).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                  <div className="suggestion-reason">{suggestion.reason}</div>
                  <button 
                    onClick={() => applySuggestion(suggestion.task_id, suggestion.suggested_time)}
                    className="apply-btn"
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`task-badge ${task.energy_level}`}>
                    {task.energy_level.charAt(0).toUpperCase() + task.energy_level.slice(1)}
                  </span>
                </div>
                
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                
                <div className="task-details">
                  <div>
                    <strong>Due:</strong> {task.due_date.toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div>
                    <strong>Duration:</strong> {task.estimated_duration} minutes
                  </div>
                </div>

                <div className="task-actions">
                  {!task.completed && (
                    <button onClick={() => task.id && handleComplete(task.id)} className="complete-btn">
                      Mark Complete
                    </button>
                  )}
                  <button onClick={() => task.id && handleDelete(task.id)} className="delete-btn">
                    Remove Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
