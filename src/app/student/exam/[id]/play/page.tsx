'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, Save, Send, AlertOctagon, Wifi, WifiOff, Maximize, AlertCircle } from 'lucide-react';

interface QuestionOption {
  optionKey: 'A' | 'B' | 'C' | 'D';
  optionText: string;
}

interface QuestionItem {
  id: string;
  questionText: string;
  marks: number;
  orderIndex: number;
  options: QuestionOption[];
  savedAnswer: {
    selectedOption: 'A' | 'B' | 'C' | 'D';
    justification: string;
  } | null;
}

interface ExamData {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  allowBackNav: boolean;
  abandonmentTimeoutSeconds: number;
}

interface AttemptData {
  id: string;
  startedAt: string;
  deadlineAt: string;
  status: string;
}

export default function ExamPlayPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local answer state map: questionId -> { selectedOption, justification, saved }
  const [answersMap, setAnswersMap] = useState<Record<string, { selectedOption: 'A' | 'B' | 'C' | 'D' | null; justification: string; saved: boolean }>>({});
  
  // Timer & Status
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Proctoring Warnings
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initExam();
  }, [examId]);

  const initExam = async () => {
    try {
      const res = await fetch(`/api/student/attempts/${examId}/start`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize exam');
      }

      setExam(data.exam);
      setAttempt(data.attempt);
      setQuestions(data.questions);

      // Populate initial answers map
      const initialMap: Record<string, { selectedOption: 'A' | 'B' | 'C' | 'D' | null; justification: string; saved: boolean }> = {};
      data.questions.forEach((q: QuestionItem) => {
        initialMap[q.id] = {
          selectedOption: q.savedAnswer?.selectedOption || null,
          justification: q.savedAnswer?.justification || '',
          saved: !!q.savedAnswer,
        };
      });
      setAnswersMap(initialMap);

      // Setup server countdown
      const deadline = new Date(data.attempt.deadlineAt).getTime();
      const serverNow = new Date(data.serverTime).getTime();
      const secondsLeft = Math.max(0, Math.floor((deadline - serverNow) / 1000));
      setRemainingSeconds(secondsLeft);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Timer Countdown Effect
  useEffect(() => {
    if (remainingSeconds <= 0 && !loading && attempt) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit('time_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, loading, attempt]);

  // 2. Heartbeat Ping Interval (Every 10 seconds)
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;

    const heartbeatInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/student/attempts/${attempt.id}/heartbeat`, { method: 'POST' });
        const data = await res.json();

        if (data.expired) {
          handleAutoSubmit('deadline_or_abandoned');
        } else if (data.remainingSeconds !== undefined) {
          setRemainingSeconds(data.remainingSeconds);
        }
      } catch (err) {
        setIsOnline(false);
      }
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, [attempt]);

  // 3. Online/Offline Network Status Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Anti-Cheating Monitoring & Event Listeners
  useEffect(() => {
    if (!attempt) return;

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      if (!isFS) {
        setShowWarningModal(true);
        setWarningMessage('WARNING: You have exited fullscreen mode. Please return to fullscreen mode immediately. Repeated violations will be audited.');
        logEvent('fullscreen_exited');
      } else {
        logEvent('fullscreen_entered');
      }
    };

    // Tab visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('tab_hidden');
      } else {
        logEvent('tab_visible');
      }
    };

    // Window focus loss
    const handleBlur = () => {
      logEvent('focus_lost');
    };

    // Prevent context menu (Right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent Copy/Paste/Cut & Ctrl key combinations
    const handleCopyPaste = (e: ClipboardEvent) => {
      // Allow copy/paste inside justification textarea if needed, but restrict on body
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V outside textarea
      const target = e.target as HTMLElement;
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [attempt]);

  const logEvent = async (eventType: string, metadata?: any) => {
    if (!attempt) return;
    try {
      await fetch(`/api/student/attempts/${attempt.id}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, metadata }),
      });
    } catch (err) {
      console.error('Failed to log event:', err);
    }
  };

  const reEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setShowWarningModal(false);
    } catch (err) {
      console.warn('Failed re-entering fullscreen:', err);
    }
  };

  // 5. Answer Save Handler
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : null;

  const handleOptionSelect = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setAnswersMap(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: optionKey,
        saved: false,
      }
    }));
  };

  const handleJustificationChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswersMap(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        justification: text,
        saved: false,
      }
    }));
  };

  const saveCurrentAnswer = async (): Promise<boolean> => {
    if (!currentQuestion || !currentAnswer || !attempt) return false;

    if (!currentAnswer.selectedOption) {
      setErrorMsg('Please select an option before proceeding.');
      return false;
    }

    if (currentAnswer.justification.trim().length < 15) {
      setErrorMsg('Justification must be at least 15 characters long explaining your answer.');
      return false;
    }

    setErrorMsg(null);
    setSavingStatus('saving');

    try {
      const res = await fetch(`/api/student/attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption: currentAnswer.selectedOption,
          justification: currentAnswer.justification.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save answer');
      }

      setAnswersMap(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          saved: true,
        }
      }));

      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
      return true;
    } catch (err: any) {
      setSavingStatus('error');
      setErrorMsg(err.message);
      return false;
    }
  };

  const handleNext = async () => {
    const success = await saveCurrentAnswer();
    if (success && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setErrorMsg(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleManualSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!attempt) return;
    setIsSubmitting(true);

    try {
      // Attempt to save current question first if modified
      if (currentAnswer?.selectedOption && currentAnswer?.justification.trim().length >= 15 && !currentAnswer.saved) {
        await saveCurrentAnswer();
      }

      const res = await fetch(`/api/student/attempts/${attempt.id}/submit`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit examination');
      }

      // Exit fullscreen before redirecting
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      router.push(`/student/exam/${examId}/result`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const handleAutoSubmit = async (reason: string) => {
    if (!attempt) return;
    try {
      await fetch(`/api/student/attempts/${attempt.id}/submit`, { method: 'POST' });
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      router.push(`/student/exam/${examId}/result?autoSubmitted=true&reason=${reason}`);
    } catch (err) {
      router.push(`/student/dashboard`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-sm">
        Initializing secure examination session...
      </div>
    );
  }

  if (errorMsg && !questions.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md text-center space-y-4">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Examination Session Error</h2>
          <p className="text-xs text-slate-400">{errorMsg}</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answersMap).filter(a => a.selectedOption !== null && a.justification.trim().length >= 15).length;
  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;
  const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col prevent-select">
      
      {/* 1. Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest hidden sm:inline">
              AI EXAM PORTAL
            </span>
            <span className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">
              {exam?.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {!isOnline && (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                <WifiOff className="w-3 h-3" />
                <span>Reconnecting...</span>
              </span>
            )}

            {/* Countdown Timer */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              remainingSeconds <= 300 
                ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse' 
                : 'bg-slate-950 text-emerald-400 border-slate-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>

            {/* Finish Exam Button */}
            <button
              onClick={handleManualSubmit}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT EXAM</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Exam Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Question Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {currentQuestion && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold font-mono">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">({currentQuestion.marks} Mark)</span>
                </div>

                {/* Auto-save status */}
                <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                  {savingStatus === 'saving' && <span className="text-amber-400 font-medium animate-pulse">Saving answer...</span>}
                  {savingStatus === 'saved' && <span className="text-emerald-400 font-medium flex items-center space-x-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
                  {currentAnswer?.saved && savingStatus === 'idle' && <span className="text-slate-500 font-medium">Saved</span>}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </div>

              {/* MCQ Options (Radio Style) */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer?.selectedOption === opt.optionKey;
                  return (
                    <button
                      key={opt.optionKey}
                      onClick={() => handleOptionSelect(opt.optionKey)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                      }`}>
                        {opt.optionKey}
                      </div>
                      <div className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mandatory Justification Textarea */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Why did you choose this answer? <span className="text-red-400">*</span>
                  <span className="text-[10px] text-slate-500 font-normal ml-2">(Minimum 15 characters required)</span>
                </label>
                
                {/* Note: Textarea must allow user select / text input */}
                <textarea
                  rows={3}
                  value={currentAnswer?.justification || ''}
                  onChange={(e) => handleJustificationChange(e.target.value)}
                  placeholder="Explain the technical reasoning supporting your selected answer here..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm leading-relaxed transition-all select-text cursor-text"
                />
                
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>AI Justification Evaluator Active</span>
                  <span className={currentAnswer?.justification && currentAnswer.justification.trim().length >= 15 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {currentAnswer?.justification?.trim().length || 0} / 15 chars min
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
                <button
                  disabled={currentIndex === 0 || !exam?.allowBackNav}
                  onClick={handlePrevious}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <span>SAVE & NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Right Column: Question Navigator Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Question Navigator</span>
              <span className="text-blue-400 font-mono">{answeredCount} / {questions.length}</span>
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 pt-2 max-h-[320px] overflow-y-auto">
              {questions.map((q, idx) => {
                const ans = answersMap[q.id];
                const isAnswered = ans && ans.selectedOption !== null && ans.justification.trim().length >= 15;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => { setErrorMsg(null); setCurrentIndex(idx); }}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={handleManualSubmit}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>FINISH & SUBMIT EXAM</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Fullscreen Exit Warning Modal (Section 24) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-bounce-short">
            <div className="w-14 h-14 bg-red-950 rounded-2xl border border-red-800 flex items-center justify-center mx-auto text-red-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-extrabold text-white">PROCTORING WARNING</h3>
            <p className="text-xs text-red-300 leading-relaxed font-medium">
              You have exited fullscreen mode! This action has been recorded in the security audit log. Please return to fullscreen immediately.
            </p>

            <button
              onClick={reEnterFullscreen}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center justify-center space-x-2 transition-all"
            >
              <Maximize className="w-4 h-4" />
              <span>RETURN TO FULLSCREEN MODE</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Submit Confirmation Modal (Section 27) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Confirm Examination Submission</h3>
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered Questions:</span>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered Questions:</span>
                <span className="font-bold text-amber-400">{questions.length - answeredCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to submit your examination? Once submitted, you will not be able to modify your answers.
            </p>

            <div className="flex items-center space-x-3">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700"
              >
                CANCEL
              </button>

              <button
                disabled={isSubmitting}
                onClick={confirmSubmit}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting ? 'SUBMITTING...' : 'YES, SUBMIT NOW'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
