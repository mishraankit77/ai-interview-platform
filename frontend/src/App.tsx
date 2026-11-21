import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { InterviewRoom } from './pages/InterviewRoom';
import { ReportPage } from './pages/ReportPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview/:id" element={<InterviewRoom />} />
          <Route path="/report/:id" element={<ReportPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
