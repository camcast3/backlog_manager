import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import BacklogPage from './pages/BacklogPage';
import GameLibraryPage from './pages/GameLibraryPage';
import ProgressPage from './pages/ProgressPage';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Nav />
          <main style={{ flex: 1, padding: '2rem', maxWidth: 1100, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/backlog" element={<BacklogPage />} />
              <Route path="/games" element={<GameLibraryPage />} />
              <Route path="/progress" element={<ProgressPage />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
