import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ user, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0]
  });

  const today = new Date().toISOString().split('T')[0];

  const fetchHabits = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletions = useCallback(async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const response = await axios.get(`${API_URL}/habits/completions`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today
        }
      });
      setCompletions(response.data);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }, [today]);

  useEffect(() => {
    fetchHabits();
    fetchCompletions();
  }, [fetchHabits, fetchCompletions]);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/habits`, newHabit);
      setHabits([response.data, ...habits]);
      setNewHabit({
        name: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      await axios.post(`${API_URL}/habits/${habitId}/complete`, {
        date: today
      });
      fetchCompletions();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const isHabitCompletedToday = (habitId) => {
    return completions.some(
      completion => completion.habit_id === habitId && 
      completion.completion_date === today
    );
  };

  const getTodaysHabits = () => {
    return habits.filter(habit => {
      const startDate = new Date(habit.start_date);
      const todayDate = new Date(today);
      
      if (startDate > todayDate) return false;
      
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') {
        const daysSinceStart = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));
        return daysSinceStart % 7 === 0;
      }
      
      return true; // For custom frequency, show all for now
    });
  };

  const getCompletionStats = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    return last7Days.map(date => {
      const dayCompletions = completions.filter(c => c.completion_date === date);
      const dayHabits = getTodaysHabits().length;
      return {
        date,
        completed: dayCompletions.length,
        total: dayHabits,
        percentage: dayHabits > 0 ? Math.round((dayCompletions.length / dayHabits) * 100) : 0
      };
    });
  };

  if (loading) {
    return <div className="loading">Loading your habits...</div>;
  }

  const todaysHabits = getTodaysHabits();
  const stats = getCompletionStats();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>HabitFlow</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="habits-section">
        <h2 className="section-title">Create New Habit</h2>
        <form className="habit-form" onSubmit={handleCreateHabit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="habitName">Habit Name</label>
              <input
                type="text"
                id="habitName"
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={newHabit.startDate}
              onChange={(e) => setNewHabit({...newHabit, startDate: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn">Create Habit</button>
        </form>
      </div>

      <div className="habits-section">
        <h2 className="section-title">Today's Habits ({todaysHabits.length})</h2>
        {todaysHabits.length === 0 ? (
          <p>No habits for today. Create your first habit above!</p>
        ) : (
          <div className="habit-list">
            {todaysHabits.map(habit => (
              <div 
                key={habit.id} 
                className={`habit-card ${isHabitCompletedToday(habit.id) ? 'completed' : ''}`}
              >
                <div className="habit-info">
                  <h4>{habit.name}</h4>
                  <div className="habit-meta">
                    {habit.frequency} • Started {new Date(habit.start_date).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteHabit(habit.id)}
                  className="complete-btn"
                  disabled={isHabitCompletedToday(habit.id)}
                >
                  {isHabitCompletedToday(habit.id) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="habits-section">
        <h2 className="section-title">7-Day Progress</h2>
        <div className="stats-grid">
          {stats.map(day => (
            <div key={day.date} className="stat-card">
              <div className="stat-date">
                {new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="stat-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${day.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {day.completed}/{day.total} ({day.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;