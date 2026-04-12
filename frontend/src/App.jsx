import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Dashboard from './pages/Dashboard';
import BacklogPage from './pages/BacklogPage';
import GameLibraryPage from './pages/GameLibraryPage';
import ProgressPage from './pages/ProgressPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { authEnabled, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (authEnabled && !user) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Nav />
      <KeyboardShortcuts />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/games" element={<GameLibraryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/recommend" element={<RecommendationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
