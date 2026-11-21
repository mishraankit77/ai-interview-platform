import React from 'react';
import { Bot, BrainCircuit, FileCheck2, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface AgentStatusProps {
  currentStage?: 'interviewer' | 'evaluator' | 'report' | 'idle';
  interviewerMessage?: string;
  evaluatorMessage?: string;
  reportMessage?: string;
}

export const AgentStatusVisualizer: React.FC<AgentStatusProps> = ({
  currentStage = 'interviewer',
  interviewerMessage,
  evaluatorMessage,
  reportMessage,
}) => {
  const agents = [
    {
      id: 'interviewer',
      name: 'Interviewer Agent',
      role: 'Contextual Question Generation',
      icon: Bot,
      color: 'from-cyan-500 to-blue-600',
      activeBorder: 'border-cyan-500/80 shadow-cyan-500/20',
      tag: 'LLM Orchestrator',
      desc: interviewerMessage || 'Tracking conversational context and framing dynamic technical challenges.',
    },
    {
      id: 'evaluator',
      name: 'Evaluator Agent',
      role: 'Real-time Answer Scoring',
      icon: BrainCircuit,
      color: 'from-indigo-500 to-purple-600',
      activeBorder: 'border-indigo-500/80 shadow-indigo-500/20',
      tag: 'Rubric Evaluator',
      desc: evaluatorMessage || 'Assessing architectural depth, code clarity, and accuracy with actionable critique.',
    },
    {
      id: 'report',
      name: 'Report Synthesis Agent',
      role: 'Comprehensive Analytics & Hiring Decision',
      icon: FileCheck2,
      color: 'from-emerald-500 to-teal-600',
      activeBorder: 'border-emerald-500/80 shadow-emerald-500/20',
      tag: 'Analytics Engine',
      desc: reportMessage || 'Consolidating multi-turn rubric metrics into executive-ready talent reports.',
    },
  ];

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Multi-Agent Orchestration Pipeline
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                LangGraph State Flow
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous co-pilots collaborating in real-time</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-slate-300 font-mono text-[11px]">Active Coordination</span>
        </div>
      </div>

      {/* 3 Agents Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((agent, index) => {
          const isActive = currentStage === agent.id;
          const isCompleted =
            (currentStage === 'evaluator' && agent.id === 'interviewer') ||
            (currentStage === 'report' && (agent.id === 'interviewer' || agent.id === 'evaluator')) ||
            currentStage === 'idle';

          const IconComponent = agent.icon;

          return (
            <div
              key={agent.id}
              className={`relative rounded-xl p-3.5 transition-all duration-300 ${
                isActive
                  ? `bg-slate-900/90 border ${agent.activeBorder} shadow-lg scale-[1.02]`
                  : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Active Agent Pulse Ring */}
              {isActive && (
                <div className="absolute top-2 right-2 flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>Processing</span>
                </div>
              )}

              {!isActive && isCompleted && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 text-emerald-400 text-[10px] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${agent.color} p-0.5 flex-shrink-0 shadow-md ${
                    isActive ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <IconComponent
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-14">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono text-slate-500">0{index + 1}.</span>
                    <h4 className="text-xs font-bold text-slate-200 truncate">{agent.name}</h4>
                  </div>
                  <p className="text-[11px] font-medium text-indigo-400 truncate mt-0.5">{agent.role}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                {agent.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
