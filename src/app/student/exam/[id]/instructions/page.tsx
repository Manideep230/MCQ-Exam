'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, Maximize2, CopyX, Eye, Clock, CheckSquare, PlayCircle, AlertTriangle, ArrowLeft, Award, HelpCircle } from 'lucide-react';

interface ExamDetails {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  startAt: string;
  endAt: string;
  questionCount?: number;
}

export default function ExamInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await fetch('/api/student/exams');
      if (!res.ok) throw new Error('Failed to load exam instructions');
      const data = await res.json();
      const match = data.exams?.find((e: any) => e.id === examId);
      if (!match) throw new Error('Exam not found or unavailable');
      setExam(match);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!agreed) return;
    setStarting(true);
    setError(null);

    try {
      // 1. Verify server attempt initiation
      const res = await fetch(`/api/student/attempts/${examId}/start`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize exam session');
      }

      // 2. Request browser Fullscreen API directly in response to user click
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        console.warn('Fullscreen request bypassed or denied:', fsErr);
      }

      // 3. Navigate to play screen
      router.push(`/student/exam/${examId}/play`);
    } catch (err: any) {
      setError(err.message);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading examination instructions...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Cannot Start Examination</h2>
          <p className="text-xs text-slate-400">{error || 'Exam unavailable'}</p>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs font-mono bg-blue-950 text-blue-400 border border-blue-800/80 px-3 py-1 rounded-full font-bold">
            CONFIDENTIAL EXAM SESSION
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">EXAMINATION RULES & PROTOCOL</span>
            <h1 className="text-2xl font-black text-white mt-1">{exam.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{exam.description || 'Official University Examination'}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">DURATION</span>
              <span className="text-sm font-bold text-white flex items-center space-x-1 mt-0.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{exam.durationMinutes} Minutes</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">TOTAL MARKS</span>
              <span className="text-sm font-bold text-white flex items-center space-x-1 mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{exam.totalMarks} Marks</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">QUESTIONS</span>
              <span className="text-sm font-bold text-white flex items-center space-x-1 mt-0.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>{exam.questionCount || 30} MCQs</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">EVALUATION</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">Objective MCQ</span>
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="space-y-4 border-t border-slate-800/80 pt-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Mandatory Anti-Cheating & Examination Terms</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-red-900/40">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Strict 3-Alert Proctoring Limit:</strong> Exiting fullscreen, switching applications, minimizing the window, switching tabs, or hovering/moving your cursor outside the exam window counts as an alert. Upon reaching <strong className="text-red-400">3 alerts</strong>, your examination will be <strong className="text-red-400">automatically submitted immediately</strong>.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <Maximize2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Fullscreen Required:</strong> Upon clicking "Start Exam", your browser will enter Fullscreen mode. Exiting fullscreen mode during the exam triggers a security alert.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <Eye className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Tab & Focus Monitoring:</strong> Switching tabs, minimizing the browser window, or losing window focus is continuously logged by the proctoring server.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <CopyX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Copy & Clipboard Prohibition:</strong> Text selection, right-clicking, copying, cutting, and pasting question text are strictly restricted.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">1-Minute Inactivity Abandonment Rule:</strong> The server continuously tracks your heartbeat. If the screen is closed or connection disappears for more than 60 seconds, your exam will be automatically submitted as abandoned.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">MCQ Selection:</strong> For each question, select the correct option (A, B, C, or D) and proceed to the next question.
                </div>
              </li>
            </ul>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-4 border-t border-slate-800/80">
            <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span className="text-xs font-semibold text-slate-200 leading-normal">
                I have read and understood all examination rules, anti-cheating requirements, and proctoring terms.
              </span>
            </label>
          </div>

          {/* Start Exam Button */}
          <button
            disabled={!agreed || starting}
            onClick={handleStartExam}
            className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl shadow-emerald-600/30"
          >
            <PlayCircle className="w-5 h-5" />
            <span>{starting ? 'INITIALIZING FULLSCREEN EXAM...' : 'START EXAM NOW'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
