import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Briefcase,
  Layers,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { getReport } from '../api';
import { InterviewReport } from '../types';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!id) return;
    getReport(id).then((rep) => {
      if (rep) {
        setReport(rep);
      } else {
        // Fallback realistic demo report if directly navigated
        setReport({
          id: `rep-${id}`,
          candidateName: 'Ankit Kumar Mishra',
          role: 'fullstack',
          roundType: 'technical',
          experienceYears: 1,
          overallScore: 82,
          hiringRecommendation: 'Hire',
          summary: 'Candidate demonstrated solid knowledge of full-stack engineering fundamentals, event loop mechanics, and database indexing. Recommended for technical round advancement with focus on hardening edge cases.',
          radarScores: {
            technicalAccuracy: 84,
            communication: 80,
            problemSolving: 85,
            depthAndInternals: 78,
            cultureAndLeadership: 82
          },
          strengths: [
            'Clear articulation of asynchronous event loop phases',
            'Strong understanding of compound indexing ESR rules in MongoDB',
            'Good structured response pacing'
          ],
          areasForImprovement: [
            'Proactively discuss memory limits and buffer pool sizing in high-concurrency systems',
            'Explain trade-offs of microtask queues over macrotasks in edge scenarios'
          ],
          detailedBreakdown: [
            {
              question: 'Explain the Node.js Event Loop phases and how process.nextTick() competes with setImmediate().',
              answer: 'Node.js event loop runs through timers, pending callbacks, idle/prepare, poll, check, and close callbacks using libuv. process.nextTick is a microtask processed immediately after the current operation finishes before the loop moves to the next phase, whereas setImmediate queues in the check phase.',
              score: 86,
              feedback: 'Strong answer covering libuv, microtasks, and phase boundaries accurately.',
              idealResponse: 'Optimal answer highlights: 1) libuv event loop phase sequence, 2) Microtask queue starvation risks with nested nextTick, 3) Practical production use cases.',
              verdict: 'Excellent'
            }
          ],
          generatedAt: new Date().toISOString()
        });
      }
    });
  }, [id]);

  const toggleTurn = (index: number) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black flex items-center justify-center text-slate-500">
        <div className="animate-pulse">Loading candidate performance report...</div>
      </div>
    );
  }

  const recColors = {
    'Strong Hire': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Hire': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'Lean Hire': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'No Hire': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800'
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back and Action Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Practice Another Round</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit</span>
            </button>
          </div>
        </div>

        {/* Executive Scorecard Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                Engineering Interview Evaluation Audit
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {report.candidateName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-2">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {report.role.toUpperCase()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {report.roundType.replace('_', ' ').toUpperCase()} ROUND
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
              <div className="text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                {report.overallScore}<span className="text-lg text-slate-400">/100</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recColors[report.hiringRecommendation]}`}>
                {report.hiringRecommendation}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Executive Evaluation Summary
            </h3>
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Competency Metric Progress Bars */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Core Competency Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Technical Accuracy', score: report.radarScores.technicalAccuracy },
                { label: 'Problem Solving & Logic', score: report.radarScores.problemSolving },
                { label: 'Communication Clarity', score: report.radarScores.communication },
                { label: 'Depth & Internals', score: report.radarScores.depthAndInternals },
                { label: 'Culture & Leadership', score: report.radarScores.cultureAndLeadership }
              ].map((metric) => (
                <div key={metric.label} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-zinc-300">{metric.label}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{metric.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1.5">
                {report.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Concrete Actionable Improvements</span>
              </div>
              <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-1.5">
                {report.areasForImprovement.map((imp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Turn-by-Turn Question Audit */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Turn-by-Turn Question & Critique Audit
          </h2>

          <div className="space-y-3">
            {report.detailedBreakdown.map((turn, idx) => {
              const isExpanded = expandedTurns[idx] ?? true;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleTurn(idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {turn.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {turn.score}/100
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-4 text-xs border-t border-slate-100 dark:border-zinc-900">
                      <div>
                        <div className="font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                          Candidate Answer:
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/70 text-slate-800 dark:text-zinc-200 leading-relaxed font-sans">
                          {turn.answer}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                          Evaluator's Honest Critique:
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 leading-relaxed">
                          {turn.feedback}
                        </div>
                      </div>

                      {turn.idealResponse && (
                        <div>
                          <div className="font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                            Benchmark Industry Standard:
                          </div>
                          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 leading-relaxed font-mono text-[11px]">
                            {turn.idealResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 dark:text-zinc-500 pt-4">
          Built with React, TypeScript & Node.js by Ankit Kumar Mishra
        </div>

      </div>
    </div>
  );
};
