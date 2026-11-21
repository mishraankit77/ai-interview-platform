import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Code, 
  Layers, 
  Users, 
  UserCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Shield,
  Volume2
} from 'lucide-react';
import { startInterview, getRoles, DEFAULT_ROLES } from '../api';
import { InterviewRoundType, RoleConfig } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('fullstack');
  const [selectedRound, setSelectedRound] = useState<InterviewRoundType>('coding_test');
  const [candidateName, setCandidateName] = useState<string>('Ankit Kumar Mishra');
  const [experienceYears, setExperienceYears] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    getRoles().then(setRoles);

    const roundParam = searchParams.get('round') as InterviewRoundType;
    if (roundParam && ['coding_test', 'technical', 'hr', 'managerial'].includes(roundParam)) {
      setSelectedRound(roundParam);
    }
  }, [searchParams]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    setIsSubmitting(true);
    try {
      const session = await startInterview(
        candidateName.trim(),
        selectedRole,
        selectedRound,
        experienceYears
      );
      navigate(`/interview/${session.id}`);
    } catch (err) {
      console.error('Failed to launch interview session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roundsConfig = [
    {
      id: 'coding_test' as InterviewRoundType,
      title: 'Level 1: Coding Test',
      subtitle: 'Live Code Editor & Algorithms',
      duration: '15 Mins',
      icon: Code,
      accent: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-500',
      activeRing: 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20',
      badge: 'Interactive Coding',
      description: 'Solve real algorithmic and data structure problems in JavaScript, TypeScript, or Python with sample test cases and Big-O constraints.'
    },
    {
      id: 'technical' as InterviewRoundType,
      title: 'Level 2: Technical Interview',
      subtitle: 'Systems, DBs & Architecture',
      duration: '10 Mins',
      icon: Layers,
      accent: 'text-cyan-600 dark:text-cyan-400',
      border: 'hover:border-cyan-500',
      activeRing: 'border-cyan-600 dark:border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
      badge: 'Deep Architecture',
      description: 'In-depth evaluation on Node.js event loop internals, React Fiber reconciliation, MongoDB indexing execution plans, and caching trade-offs.'
    },
    {
      id: 'hr' as InterviewRoundType,
      title: 'Level 3: HR Interview',
      subtitle: 'Behavioral & Culture Fit',
      duration: '8 Mins',
      icon: Users,
      accent: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-500',
      activeRing: 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
      badge: 'STAR Method',
      description: 'Behavioral assessment evaluating your adaptability, communication clarity, teamwork, handling critical feedback, and alignment.'
    },
    {
      id: 'managerial' as InterviewRoundType,
      title: 'Level 4: Managerial Interview',
      subtitle: 'Trade-offs & Leadership',
      duration: '10 Mins',
      icon: UserCheck,
      accent: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-500',
      activeRing: 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
      badge: 'Engineering Ownership',
      description: 'Real-world engineering scenarios: managing technical debt vs tight product delivery, Friday production incident protocols, and cross-team alignment.'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 mb-6">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Professional Tech Interview Preparation Suite</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Master Tech Interviews with Real-Time Honest Feedback
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Select an interview round, experience realistic Indian interviewer voice pacing, timed questions, and strict, un-sugarcoated candidate evaluations.
        </p>
      </div>

      {/* Main Interactive Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <form onSubmit={handleStart} className="space-y-8">

          {/* 1. Step: Select Interview Level */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Choose Your Interview Round
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Four distinct levels tailored to standard engineering hiring loops.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roundsConfig.map((round) => {
                const IconComponent = round.icon;
                const isSelected = selectedRound === round.id;

                return (
                  <div
                    key={round.id}
                    onClick={() => setSelectedRound(round.id)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? round.activeRing + ' shadow-md'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 ' + round.border
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 ${round.accent}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                            {round.duration} Session
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {round.title}
                          </h3>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300">
                        {round.badge}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {round.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Step: Target Role and Profile */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Step 2: Candidate Details & Target Domain
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Enter candidate name"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                  Experience Tier
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                >
                  <option value={0}>0–1 Year (Fresher / Junior Developer)</option>
                  <option value={2}>1–3 Years (Associate Engineer)</option>
                  <option value={4}>3–5 Years (Mid-Level Engineer)</option>
                </select>
              </div>
            </div>

            {/* Target Role Track */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
                Engineering Discipline
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((r) => {
                  const isRoleActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all text-xs ${
                        isRoleActive
                          ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-1">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {r.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Launch CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real Indian voice, countdown timers, and honest evaluation rubrics active.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Initializing Interview Room...' : 'Start Interview Session'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
