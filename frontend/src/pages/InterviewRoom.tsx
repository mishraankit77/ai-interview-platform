import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Send, 
  RotateCcw, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Terminal,
  Clock
} from 'lucide-react';
import { getSession, submitAnswer } from '../api';
import { InterviewSession, TurnEvaluation, Question } from '../types';
import { voiceService } from '../utils/voiceService';
import { Timer } from '../components/Timer';
import { CodeEditor } from '../components/CodeEditor';

export const InterviewRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestEvaluation, setLatestEvaluation] = useState<TurnEvaluation | null>(null);

  // Audio / Speech Recognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakingAI, setIsSpeakingAI] = useState<boolean>(false);

  // Camera preview
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Code editor state (for coding_test round)
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [codeContent, setCodeContent] = useState<string>('');

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Load session
  useEffect(() => {
    if (!id) return;
    getSession(id).then((sess) => {
      if (sess) {
        setSession(sess);
        const currentQ = sess.questions[sess.currentQuestionIndex || 0];
        if (currentQ?.codingChallenge) {
          setCodeContent(currentQ.codingChallenge.starterCode[codeLanguage] || '');
        }
        // Auto-speak initial question with Indian voice
        speakQuestion(currentQ?.text);
      }
    });

    return () => {
      voiceService.cancel();
    };
  }, [id]);

  // Video stream initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isVideoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera preview unavailable:', err);
          setIsVideoOn(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-IN'; // Indian English recognition

      recognizer.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech-to-text is supported in Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const speakQuestion = (text?: string) => {
    if (!text || isMuted) return;
    setIsSpeakingAI(true);
    voiceService.speak(
      text,
      () => setIsSpeakingAI(true),
      () => setIsSpeakingAI(false)
    );
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voiceService.setMuted(nextMuted);
    if (nextMuted) setIsSpeakingAI(false);
  };

  const handleSubmitAnswer = async () => {
    if (!session || isSubmitting) return;
    if (!currentAnswer.trim() && !codeContent.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSubmitting(true);
    try {
      const res = await submitAnswer(
        session.id,
        currentAnswer,
        session.roundType === 'coding_test' ? codeContent : undefined,
        codeLanguage
      );

      setLatestEvaluation(res.evaluation);

      if (res.isComplete) {
        setTimeout(() => {
          navigate(`/report/${session.id}`);
        }, 3000);
      } else if (res.nextQuestion) {
        const nextQ = res.nextQuestion;
        setCurrentAnswer('');
        setSession((prev) => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          messages: [...prev.messages, {
            id: 'candidate-' + Date.now(),
            sender: 'candidate',
            content: currentAnswer,
            timestamp: new Date().toISOString(),
            evaluation: res.evaluation
          }, {
            id: 'next-' + Date.now(),
            sender: 'interviewer',
            content: nextQ.text,
            timestamp: new Date().toISOString()
          }]
        } : null);

        // Auto speak next question with Indian voice
        speakQuestion(nextQ.text);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ: Question | undefined = session?.questions?.[session?.currentQuestionIndex || 0] || session?.questions?.[0];
  const roundTypeLabel = (session?.roundType || 'technical').replace('_', ' ').toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              {roundTypeLabel} ROUND
            </span>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              Candidate: <span className="font-semibold text-slate-800 dark:text-white">{session?.candidateName || 'Candidate'}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              Question: <span className="font-semibold text-slate-800 dark:text-white">{(session?.currentQuestionIndex || 0) + 1} of {session?.questions.length || 1}</span>
            </div>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="flex items-center gap-3">
            <Timer 
              initialSeconds={currentQ?.timeLimitSeconds || 180} 
              onTimeExpire={() => {
                if (currentAnswer.trim() || codeContent.trim()) {
                  handleSubmitAnswer();
                }
              }}
            />

            <button
              onClick={() => navigate(`/report/${session?.id}`)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
            >
              Finish Early
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Interviewer & Video Feed */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* AI Interlocutor Card with Indian Voice Tag */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      AI
                    </div>
                    {isSpeakingAI && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full animate-ping" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Technical Interviewer
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <span>Indian Accent</span>
                      <span>•</span>
                      <span className={isSpeakingAI ? 'text-emerald-500 font-medium' : ''}>
                        {isSpeakingAI ? 'Speaking...' : 'Listening'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakQuestion(currentQ?.text)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Replay Question Audio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleMuteToggle}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
                  </button>
                </div>
              </div>

              {/* Sound Wave Animation when Interviewer speaks */}
              <div className="h-6 flex items-center justify-center gap-1 bg-slate-50 dark:bg-zinc-900 rounded-lg overflow-hidden px-2">
                {isSpeakingAI ? (
                  [40, 70, 95, 60, 85, 45, 90, 75, 50, 80].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-indigo-500 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    Audio channel ready
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Webcam Stream Card */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-black overflow-hidden aspect-video flex items-center justify-center shadow-xs">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold">
                    {session?.candidateName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs">Camera Feed Inactive</span>
                </div>
              )}

              {/* In-feed Camera Overlay Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs">
                <span className="font-medium truncate max-w-[140px]">
                  {session?.candidateName || 'Candidate'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="p-1 rounded-md hover:bg-white/20 transition-colors"
                    title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isVideoOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                  <button
                    onClick={toggleSpeechRecognition}
                    className="p-1 rounded-md hover:bg-white/20 transition-colors"
                    title={isListening ? 'Stop Mic' : 'Start Mic'}
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <MicOff className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Honest Evaluation Feedback (if turn just evaluated) */}
            {latestEvaluation && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Honest Turn Assessment
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    latestEvaluation.score >= 75
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : latestEvaluation.score >= 50
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}>
                    {latestEvaluation.score}/100 • {latestEvaluation.verdict}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {latestEvaluation.feedback}
                </p>

                {latestEvaluation.weaknesses?.length > 0 && (
                  <div className="text-[11px] space-y-1 text-rose-600 dark:text-rose-400">
                    <div className="font-semibold">Critical Gaps:</div>
                    {latestEvaluation.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Question Workspace & Live Input */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Active Question Prompt Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentQ?.category || 'Technical Prompt'}
                </span>
                <span>Expected Time: ~{Math.round((currentQ?.timeLimitSeconds || 180) / 60)} minutes</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ?.text || 'Loading prompt...'}
              </h2>

              {/* STAR Hint for HR rounds */}
              {session?.roundType === 'hr' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Interviewer Tip (STAR Framework):</span>
                  </div>
                  <div>Structure your verbal answer: <strong>Situation</strong> (context), <strong>Task</strong> (your responsibility), <strong>Action</strong> (steps taken), and <strong>Result</strong> (measurable outcome).</div>
                </div>
              )}
            </div>

            {/* If Coding Test: Render Live Code Editor */}
            {session?.roundType === 'coding_test' && currentQ?.codingChallenge && (
              <CodeEditor
                code={codeContent}
                onChange={setCodeContent}
                language={codeLanguage}
                onLanguageChange={(lang) => {
                  setCodeLanguage(lang);
                  setCodeContent(currentQ.codingChallenge?.starterCode[lang] || '');
                }}
                testCases={currentQ.codingChallenge.testCases}
              />
            )}

            {/* Answer Verbal / Written Composition Box */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {session?.roundType === 'coding_test' ? 'Complexity Explanation & Walkthrough:' : 'Your Answer:'}
                </label>

                {/* Speech Recognition Dictation Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isListening
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse border border-rose-300 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Listening (Speak now)...' : 'Talk to Answer (Speech-to-Text)'}</span>
                </button>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={session?.roundType === 'coding_test' ? 3 : 6}
                placeholder={
                  session?.roundType === 'coding_test'
                    ? 'Explain your data structure decisions, optimal Big-O time and space complexity, and how you handle boundary test cases...'
                    : 'Articulate your response clearly. Be specific about internal mechanics, trade-offs, and concrete examples...'
                }
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || (!currentAnswer.trim() && !codeContent.trim())}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <span>{isSubmitting ? 'Evaluating with Rubric...' : 'Submit Answer'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
