'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, Save, Send, AlertOctagon, Wifi, WifiOff, Maximize, AlertCircle } from 'lucide-react';

interface QuestionOption {
  optionKey: string;
  optionText: string;
}

interface QuestionItem {
  id: string;
  questionText: string;
  marks: number;
  orderIndex: number;
  options: QuestionOption[];
  savedAnswer: {
    selectedOption: string;
    justification?: string;
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

  // Local answer state map: questionId -> { selectedOption, saved }
  const [answersMap, setAnswersMap] = useState<Record<string, { selectedOption: string | null; saved: boolean }>>({});
  
  // Timer & Status
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Proctoring Warnings (3-Alert System)
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [alertCount, setAlertCount] = useState<number>(0);
  const alertCountRef = useRef<number>(0);
  const lastAlertTimeRef = useRef<number>(0);
  const isAutoSubmittingRef = useRef<boolean>(false);

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
      const initialMap: Record<string, { selectedOption: string | null; saved: boolean }> = {};
      data.questions.forEach((q: QuestionItem) => {
        initialMap[q.id] = {
          selectedOption: q.savedAnswer?.selectedOption || null,
          saved: !!q.savedAnswer,
        };
      });

      // Restore from localStorage backup if any answers were saved locally
      try {
        const localCacheStr = localStorage.getItem(`exam_answers_${data.attempt.id}`);
        if (localCacheStr) {
          const localCache = JSON.parse(localCacheStr);
          Object.entries(localCache).forEach(([qId, opt]) => {
            if (opt && initialMap[qId] && !initialMap[qId].selectedOption) {
              initialMap[qId] = {
                selectedOption: opt as string,
                saved: false,
              };
            }
          });
        }
      } catch (e) {}

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

  // Register a proctoring violation alert (Max 3 Alerts Rule)
  const registerViolationAlert = (eventType: string, reasonText: string) => {
    if (isAutoSubmittingRef.current) return;

    const now = Date.now();
    // 1.5 second cooldown to avoid duplicate increments from simultaneous events (e.g. blur + visibilitychange + fullscreenchange)
    if (now - lastAlertTimeRef.current < 1500) {
      logEvent(eventType, { reason: reasonText, duplicateSuppressed: true });
      return;
    }

    lastAlertTimeRef.current = now;
    const newCount = alertCountRef.current + 1;
    alertCountRef.current = newCount;
    setAlertCount(newCount);
    setWarningReason(reasonText);
    setShowWarningModal(true);

    logEvent(eventType, { alertCount: newCount, reason: reasonText });

    if (newCount >= 3) {
      isAutoSubmittingRef.current = true;
      setWarningMessage(`CRITICAL PROCTORING VIOLATION: Maximum 3 alerts reached (${reasonText}). Examination is being automatically submitted now.`);
      setTimeout(() => {
        handleAutoSubmit('proctoring_alerts_exceeded');
      }, 1500);
    } else {
      setWarningMessage(`WARNING: ${reasonText}. You have ${3 - newCount} warning(s) remaining before automatic test submission.`);
    }
  };

  // 4. Anti-Cheating Monitoring & Event Listeners
  useEffect(() => {
    if (!attempt) return;

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      if (!isFS) {
        registerViolationAlert('fullscreen_exited', 'Exited Fullscreen Mode');
      } else {
        logEvent('fullscreen_entered');
      }
    };

    // Tab visibility change detection (switching tabs or minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolationAlert('tab_hidden', 'Switched Tab / Window Hidden');
      } else {
        logEvent('tab_visible');
      }
    };

    // Window focus loss (App switching / minimizing window)
    const handleBlur = () => {
      registerViolationAlert('focus_lost', 'Switched Application / Window Focus Lost');
    };

    // Hovering outside app window / hovering external apps / moving mouse out of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        registerViolationAlert('cursor_left_window', 'Cursor Left Examination Window / Hovered External App');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        registerViolationAlert('cursor_left_window', 'Cursor Left Examination Window / Hovered External App');
      }
    };

    // Prevent context menu (Right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent Copy/Paste/Cut
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseout', handleMouseOut);
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

  const handleOptionSelect = (optionKey: string) => {
    if (!currentQuestion || !attempt) return;
    setAnswersMap(prev => {
      const updated = {
        ...prev,
        [currentQuestion.id]: {
          selectedOption: optionKey,
          saved: false,
        }
      };
      // Persist backup to localStorage immediately
      try {
        const cache: Record<string, string> = {};
        Object.entries(updated).forEach(([k, v]) => {
          if (v.selectedOption) cache[k] = v.selectedOption;
        });
        localStorage.setItem(`exam_answers_${attempt.id}`, JSON.stringify(cache));
      } catch (e) {}
      return updated;
    });
    // Instant auto-save to server on option click
    saveSingleAnswerToServer(currentQuestion.id, optionKey);
  };

  const saveSingleAnswerToServer = async (questionId: string, optionKey: string, retryCount = 0): Promise<boolean> => {
    if (!attempt) return false;
    setErrorMsg(null);
    setSavingStatus('saving');

    try {
      const res = await fetch(`/api/student/attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOption: optionKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save answer');
      }

      setAnswersMap(prev => {
        const updated = {
          ...prev,
          [questionId]: {
            selectedOption: optionKey,
            saved: true,
          }
        };
        try {
          const cache: Record<string, string> = {};
          Object.entries(updated).forEach(([k, v]) => {
            if (v.selectedOption) cache[k] = v.selectedOption;
          });
          localStorage.setItem(`exam_answers_${attempt.id}`, JSON.stringify(cache));
        } catch (e) {}
        return updated;
      });

      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
      return true;
    } catch (err: any) {
      console.warn(`Save answer failed for question ${questionId} (attempt ${retryCount + 1}):`, err.message);
      setSavingStatus('error');
      // Automatic quick retry if network dropped briefly
      if (retryCount < 2) {
        setTimeout(() => {
          saveSingleAnswerToServer(questionId, optionKey, retryCount + 1);
        }, 1200);
      }
      return false;
    }
  };

  // Continuous background synchronization retry for any unsaved answers
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;

    const retryInterval = setInterval(() => {
      const unsaved = Object.entries(answersMap).filter(([_, val]) => val.selectedOption && !val.saved);
      if (unsaved.length > 0) {
        unsaved.forEach(([qId, val]) => {
          if (val.selectedOption) {
            saveSingleAnswerToServer(qId, val.selectedOption);
          }
        });
      }
    }, 4000);

    return () => clearInterval(retryInterval);
  }, [attempt, answersMap]);

  const saveCurrentAnswer = async (): Promise<boolean> => {
    if (!currentQuestion || !currentAnswer || !attempt) return false;
    if (!currentAnswer.selectedOption) {
      return false;
    }
    return await saveSingleAnswerToServer(currentQuestion.id, currentAnswer.selectedOption);
  };

  const flushAllUnsavedAnswers = async () => {
    if (!attempt) return;
    const entries = Object.entries(answersMap);
    for (const [qId, val] of entries) {
      if (val.selectedOption && !val.saved) {
        await saveSingleAnswerToServer(qId, val.selectedOption);
      }
    }
  };

  const handleNavigateQuestion = async (targetIdx: number) => {
    if (targetIdx === currentIndex) return;
    if (currentQuestion && currentAnswer?.selectedOption && !currentAnswer.saved) {
      saveSingleAnswerToServer(currentQuestion.id, currentAnswer.selectedOption);
    }
    setErrorMsg(null);
    setCurrentIndex(targetIdx);
  };

  const handleNext = async () => {
    if (currentAnswer?.selectedOption && !currentAnswer.saved) {
      saveSingleAnswerToServer(currentQuestion.id, currentAnswer.selectedOption);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = async () => {
    if (currentAnswer?.selectedOption && !currentAnswer.saved) {
      saveSingleAnswerToServer(currentQuestion.id, currentAnswer.selectedOption);
    }
    if (currentIndex > 0) {
      setErrorMsg(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getAnswersPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {};
    Object.entries(answersMap).forEach(([qId, val]) => {
      if (val.selectedOption) {
        payload[qId] = val.selectedOption;
      }
    });
    return payload;
  };

  const handleManualSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!attempt) return;
    setIsSubmitting(true);

    try {
      // 1. Flush any pending unsaved answers in state
      await flushAllUnsavedAnswers();

      // 2. Submit with entire answers payload so server guarantees all marked answers are saved
      const answersPayload = getAnswersPayload();
      const res = await fetch(`/api/student/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit examination');
      }

      try {
        localStorage.removeItem(`exam_answers_${attempt.id}`);
      } catch (e) {}

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
      await flushAllUnsavedAnswers();
      const answersPayload = getAnswersPayload();
      await fetch(`/api/student/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });
      try {
        localStorage.removeItem(`exam_answers_${attempt.id}`);
      } catch (e) {}
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
      <div className="min-h-screen bg-[#f8e7c9] flex items-center justify-center text-[#064E3B] text-sm font-black">
        Initializing secure examination session...
      </div>
    );
  }

  if (errorMsg && !questions.length) {
    return (
      <div className="min-h-screen bg-[#f8e7c9] flex flex-col items-center justify-center p-4">
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 max-w-md text-center space-y-4 shadow-xl">
          <AlertOctagon className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-lg font-black text-[#064E3B]">Examination Session Error</h2>
          <p className="text-xs text-[#064E3B]/80 font-semibold">{errorMsg}</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] rounded-xl text-xs font-black"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answersMap).filter(a => a.selectedOption !== null).length;
  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;
  const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#f8e7c9] text-[#064E3B] flex flex-col prevent-select">
      
      {/* 1. Header Bar */}
      <header className="bg-[#faedd7] border-b-2 border-[#064E3B]/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black text-[#064E3B] uppercase tracking-widest hidden sm:inline">
              ONLINE EXAM
            </span>
            <span className="text-sm font-black text-[#064E3B] truncate max-w-[150px] sm:max-w-xs">
              {exam?.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {!isOnline && (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-black">
                <WifiOff className="w-3 h-3" />
                <span>Reconnecting...</span>
              </span>
            )}

            {/* Countdown Timer */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-black ${
              remainingSeconds <= 300 
                ? 'bg-red-100 text-red-800 border-red-400 animate-pulse' 
                : 'bg-[#fffdf9] text-[#064E3B] border-[#064E3B]/20'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>

            {/* Proctoring Warning Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-mono font-black ${
              alertCount === 0
                ? 'bg-[#fffdf9] text-[#064E3B] border-[#064E3B]/20'
                : alertCount === 1
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-red-100 text-red-800 border-red-400 animate-pulse'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>Alerts: {alertCount} / 3</span>
            </div>

            {/* Finish Exam Button */}
            <button
              onClick={handleManualSubmit}
              className="px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5 border-2 border-[#064E3B]"
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
            <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-xs flex items-center space-x-3 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {currentQuestion && (
            <div className="bg-[#fffdf9] border-2 border-[#064E3B]/20 rounded-2xl p-6 space-y-6 shadow-sm">
              
              {/* Question Header */}
              <div className="flex items-center justify-between border-b-2 border-[#064E3B]/10 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-lg bg-[#faedd7] text-[#064E3B] border border-[#064E3B]/30 text-xs font-black font-mono">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-[#064E3B]/70 font-bold">({currentQuestion.marks} Mark)</span>
                </div>

                {/* Auto-save status */}
                <div className="text-xs text-[#064E3B]/70 flex items-center space-x-1.5 font-bold">
                  {savingStatus === 'saving' && <span className="text-amber-700 font-black animate-pulse">Saving answer...</span>}
                  {savingStatus === 'saved' && <span className="text-[#064E3B] font-black flex items-center space-x-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
                  {currentAnswer?.saved && savingStatus === 'idle' && <span className="text-[#064E3B]/60 font-semibold">Saved</span>}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base font-bold text-[#064E3B] leading-relaxed whitespace-pre-line">
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3.5 ${
                        isSelected
                          ? 'bg-[#faedd7] border-[#064E3B] text-[#064E3B] shadow-sm'
                          : 'bg-[#fffdf9] border-[#064E3B]/20 text-[#064E3B] hover:border-[#064E3B]/50 hover:bg-[#faedd7]/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-black transition-all ${
                        isSelected ? 'bg-[#064E3B] border-[#064E3B] text-[#f8e7c9]' : 'border-[#064E3B]/40 text-[#064E3B]'
                      }`}>
                        {opt.optionKey}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {opt.optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t-2 border-[#064E3B]/10">
                <button
                  disabled={currentIndex === 0 || !exam?.allowBackNav}
                  onClick={handlePrevious}
                  className="px-4 py-2.5 rounded-xl bg-[#faedd7] hover:bg-[#f3deba] border-2 border-[#064E3B]/30 text-[#064E3B] font-black text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-1.5 transition-all border-2 border-[#064E3B]"
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
          <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#064E3B] uppercase tracking-wider flex items-center justify-between">
              <span>Question Navigator</span>
              <span className="text-[#064E3B] font-mono font-black">{answeredCount} / {questions.length}</span>
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold text-[#064E3B]/80 pt-1">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#064E3B]" />
                <span>Saved</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Syncing</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#faedd7] border border-[#064E3B]/40" />
                <span>Empty</span>
              </div>
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 pt-2 max-h-[320px] overflow-y-auto">
              {questions.map((q, idx) => {
                const ans = answersMap[q.id];
                const isAnswered = ans && ans.selectedOption !== null;
                const isSaved = ans && ans.saved;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavigateQuestion(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-black transition-all flex items-center justify-center relative border-2 ${
                      isCurrent
                        ? 'bg-[#064E3B] text-[#f8e7c9] border-[#064E3B] shadow-md ring-2 ring-[#064E3B]/50'
                        : isAnswered
                        ? isSaved
                          ? 'bg-[#064E3B]/15 text-[#064E3B] border-[#064E3B]/40 hover:bg-[#064E3B]/25'
                          : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200 animate-pulse'
                        : 'bg-[#fffdf9] text-[#064E3B]/60 border-[#064E3B]/20 hover:border-[#064E3B]'
                    }`}
                  >
                    {idx + 1}
                    {isAnswered && !isSaved && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t-2 border-[#064E3B]/15">
              <button
                onClick={handleManualSubmit}
                className="w-full py-3 px-4 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider border-2 border-[#064E3B] transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                <Send className="w-3.5 h-3.5 text-[#f8e7c9]" />
                <span>FINISH & SUBMIT EXAM</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Fullscreen Exit & Proctoring Alert Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl text-[#064E3B]">
            <div className="w-16 h-16 bg-red-100 rounded-2xl border-2 border-red-500 flex items-center justify-center mx-auto text-red-700">
              <ShieldAlert className="w-9 h-9" />
            </div>
            
            <div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-[11px] font-mono font-black uppercase tracking-wider">
                {alertCount >= 3 ? 'FINAL VIOLATION (3/3)' : `PROCTORING ALERT (${alertCount}/3)`}
              </span>
              <h3 className="text-xl font-black text-[#064E3B] mt-2">
                {alertCount >= 3 ? 'EXAM AUTO-SUBMITTING' : 'SECURITY ALERT DETECTED'}
              </h3>
            </div>

            {/* Alert Progress Stepper */}
            <div className="flex items-center justify-center space-x-2 py-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2.5 flex-1 rounded-full transition-all ${
                    step <= alertCount
                      ? 'bg-red-600 shadow-md'
                      : 'bg-[#064E3B]/20'
                  }`}
                />
              ))}
            </div>
            
            <div className="p-3.5 rounded-xl bg-[#fffdf9] border-2 border-red-400 text-xs text-red-900 font-semibold leading-relaxed text-left space-y-1">
              <p className="font-black text-red-950 uppercase text-[10px] tracking-wider">Violation Reason:</p>
              <p className="font-bold text-red-900">{warningReason || 'Proctoring Violation'}</p>
              <p className="text-red-800 text-[11px] pt-1">{warningMessage}</p>
            </div>

            {alertCount >= 3 ? (
              <div className="py-3.5 px-4 rounded-xl bg-red-100 border-2 border-red-500 text-red-900 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 animate-pulse">
                <span>Auto-submitting examination...</span>
              </div>
            ) : (
              <button
                onClick={reEnterFullscreen}
                className="w-full py-3.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all"
              >
                <Maximize className="w-4 h-4" />
                <span>I UNDERSTAND & RETURN TO EXAM</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-[#064E3B] rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl text-[#064E3B]">
            <h3 className="text-lg font-black text-[#064E3B]">Confirm Examination Submission</h3>
            
            <div className="p-4 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20 space-y-2 text-xs text-[#064E3B]">
              <div className="flex justify-between">
                <span className="font-semibold">Total Questions:</span>
                <span className="font-black text-[#064E3B]">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Answered Questions:</span>
                <span className="font-black text-[#064E3B]">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Unanswered Questions:</span>
                <span className="font-black text-amber-800">{questions.length - answeredCount}</span>
              </div>
            </div>

            <p className="text-xs text-[#064E3B]/80 font-medium">
              Are you sure you want to submit your examination? Once submitted, you will not be able to modify your answers.
            </p>

            <div className="flex items-center space-x-3">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#faedd7] hover:bg-[#f3deba] text-[#064E3B] font-black text-xs uppercase tracking-wider border-2 border-[#064E3B]/30"
              >
                CANCEL
              </button>

              <button
                disabled={isSubmitting}
                onClick={confirmSubmit}
                className="flex-1 py-3 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider shadow-md border-2 border-[#064E3B]"
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
