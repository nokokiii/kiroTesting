import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/signup" element={<div>Signup Page</div>} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/u/:username" element={<div>Public Portfolio</div>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

// Temporary home page component
const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          FreelanceForge
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Personal portfolio builder for freelancers
        </p>
        <div className="space-x-4">
          <a href="/signup" className="btn-primary">
            Get Started
          </a>
          <a href="/login" className="btn-secondary">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
