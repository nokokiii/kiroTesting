# HabitFlow

A simple, clean habit tracking web application built with React and Node.js.

## Features

- **User Authentication**: Register, login, and logout
- **Habit Management**: Create habits with daily/weekly frequency
- **Daily Dashboard**: View and complete today's habits
- **Progress Tracking**: 7-day completion overview with visual progress bars
- **Mobile Responsive**: Clean, minimal UI that works on all devices

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT tokens with bcrypt password hashing

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - React frontend on http://localhost:3000

3. **Open your browser** and go to http://localhost:3000

## Project Structure

```
habitflow/
├── server/
│   ├── database/
│   │   └── init.js          # Database setup and schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── habits.js        # Habit management routes
│   └── index.js             # Express server setup
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js     # Login form
│   │   │   ├── Register.js  # Registration form
│   │   │   └── Dashboard.js # Main habit dashboard
│   │   ├── App.js           # Main React component
│   │   └── App.css          # Styles
│   └── public/
└── package.json             # Root package.json with scripts
```

## Database Schema

### Users
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `created_at`

### Habits
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `name`
- `frequency` ('daily', 'weekly', 'custom')
- `custom_days` (JSON for custom frequency)
- `start_date`
- `created_at`

### Habit Completions
- `id` (Primary Key)
- `habit_id` (Foreign Key)
- `completion_date`
- `created_at`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `POST /api/habits/:id/complete` - Mark habit as completed
- `GET /api/habits/completions` - Get completion history

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

## Development

- **Backend only**: `npm run server`
- **Frontend only**: `npm run client`
- **Both together**: `npm run dev`

## Production Build

```bash
cd client && npm run build
```

The built files will be in `client/build/` and can be served by the Express server in production mode.

## Next Steps

Some ideas for extending HabitFlow:

- Add habit streaks and statistics
- Implement custom frequency patterns
- Add habit categories and tags
- Include habit notes and reflections
- Add social features (sharing progress)
- Implement push notifications
- Add data export functionality