import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Github, Volume2, ShieldCheck, Code, Layers, Users, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-slate-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo />
        </Link>

        {/* 4 Interview Levels Quick Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-medium">
          <Link
            to="/?round=coding_test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-all"
          >
            <Code className="w-3.5 h-3.5 text-indigo-500" />
            <span>Coding Test</span>
          </Link>
          <Link
            to="/?round=technical"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            <span>Technical</span>
          </Link>
          <Link
            to="/?round=hr"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>HR Round</span>
          </Link>
          <Link
            to="/?round=managerial"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Managerial</span>
          </Link>
        </nav>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2.5">
          {/* Indian Voice Audio Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
            <Volume2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Voice: Indian English (en-IN)</span>
          </div>

          {/* GitHub Repository */}
          <a
            href="https://github.com/mishraankit77"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="GitHub Profile"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
