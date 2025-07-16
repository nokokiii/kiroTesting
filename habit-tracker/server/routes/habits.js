const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all habits for user
router.get('/', auth, (req, res) => {
  db.all(
    'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, habits) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(habits);
    }
  );
});

// Create habit
router.post('/', auth, (req, res) => {
  const { name, frequency, customDays, startDate } = req.body;

  if (!name || !frequency || !startDate) {
    return res.status(400).json({ error: 'Name, frequency, and start date are required' });
  }

  const customDaysJson = frequency === 'custom' ? JSON.stringify(customDays) : null;

  db.run(
    'INSERT INTO habits (user_id, name, frequency, custom_days, start_date) VALUES (?, ?, ?, ?, ?)',
    [req.userId, name, frequency, customDaysJson, startDate],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      
      db.get(
        'SELECT * FROM habits WHERE id = ?',
        [this.lastID],
        (err, habit) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.json(habit);
        }
      );
    }
  );
});

// Mark habit as completed
router.post('/:id/complete', auth, (req, res) => {
  const { date } = req.body;
  const habitId = req.params.id;

  // Verify habit belongs to user
  db.get(
    'SELECT * FROM habits WHERE id = ? AND user_id = ?',
    [habitId, req.userId],
    (err, habit) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      db.run(
        'INSERT OR IGNORE INTO habit_completions (habit_id, completion_date) VALUES (?, ?)',
        [habitId, date],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.json({ message: 'Habit marked as completed' });
        }
      );
    }
  );
});

// Get habit completions for date range
router.get('/completions', auth, (req, res) => {
  const { startDate, endDate } = req.query;

  db.all(`
    SELECT hc.*, h.name as habit_name 
    FROM habit_completions hc
    JOIN habits h ON hc.habit_id = h.id
    WHERE h.user_id = ? AND hc.completion_date BETWEEN ? AND ?
    ORDER BY hc.completion_date DESC
  `, [req.userId, startDate, endDate], (err, completions) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(completions);
  });
});

module.exports = router;