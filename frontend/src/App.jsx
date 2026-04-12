import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Dashboard from './pages/Dashboard';
import BacklogPage from './pages/BacklogPage';
import GameLibraryPage from './pages/GameLibraryPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <div className="app-layout">
            <Nav />
            <KeyboardShortcuts />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/backlog" element={<BacklogPage />} />
                <Route path="/games" element={<GameLibraryPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
