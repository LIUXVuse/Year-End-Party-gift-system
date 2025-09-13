
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import GiverPage from './pages/GiverPage';
import DisplayPage from './pages/DisplayPage';
import AdminAuthPage from './pages/AdminAuthPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/giver" element={<GiverPage />} />
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/admin" element={<AdminAuthPage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;