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
      <div className="min-h-screen bg-[#f8e7c9] flex items-center justify-center text-[#064E3B] text-sm font-bold">
        Loading examination instructions...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-[#f8e7c9] flex flex-col items-center justify-center p-4">
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-[#064E3B] mx-auto" />
          <h2 className="text-lg font-black text-[#064E3B]">Cannot Start Examination</h2>
          <p className="text-xs text-[#064E3B]/80 font-semibold">{error || 'Exam unavailable'}</p>
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

  return (
    <div className="min-h-screen bg-[#f8e7c9] text-[#064E3B] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center space-x-2 text-xs font-black text-[#064E3B] hover:text-[#04382b] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs font-mono bg-[#064E3B] text-[#f8e7c9] px-3 py-1 rounded-full font-bold">
            CONFIDENTIAL EXAM SESSION
          </span>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div>
            <span className="text-xs font-black text-[#064E3B] uppercase tracking-widest">EXAMINATION RULES & PROTOCOL</span>
            <h1 className="text-2xl font-black text-[#064E3B] mt-1">{exam.title}</h1>
            <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">{exam.description || 'Official University Examination'}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20">
            <div>
              <span className="text-[10px] text-[#064E3B]/70 uppercase font-black block">DURATION</span>
              <span className="text-sm font-black text-[#064E3B] flex items-center space-x-1 mt-0.5">
                <Clock className="w-4 h-4 text-[#064E3B]" />
                <span>{exam.durationMinutes} Minutes</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#064E3B]/70 uppercase font-black block">TOTAL MARKS</span>
              <span className="text-sm font-black text-[#064E3B] flex items-center space-x-1 mt-0.5">
                <Award className="w-4 h-4 text-[#064E3B]" />
                <span>{exam.totalMarks} Marks</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#064E3B]/70 uppercase font-black block">QUESTIONS</span>
              <span className="text-sm font-black text-[#064E3B] flex items-center space-x-1 mt-0.5">
                <HelpCircle className="w-4 h-4 text-[#064E3B]" />
                <span>{exam.questionCount || 30} MCQs</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#064E3B]/70 uppercase font-black block">EVALUATION</span>
              <span className="text-sm font-black text-[#064E3B] mt-0.5 block">Objective MCQ</span>
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="space-y-4 border-t-2 border-[#064E3B]/15 pt-6">
            <h3 className="text-sm font-black text-[#064E3B] uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#064E3B]" />
              <span>Mandatory Anti-Cheating & Examination Terms</span>
            </h3>

            <ul className="space-y-3 text-xs text-[#064E3B]">
              <li className="flex items-start space-x-3 bg-red-100 p-3 rounded-xl border-2 border-red-400 text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-950 font-black">Strict 3-Alert Proctoring Limit:</strong> Exiting fullscreen, switching applications, minimizing the window, switching tabs, or hovering/moving your cursor outside the exam window counts as an alert. Upon reaching <strong className="text-red-800 font-black">3 alerts</strong>, your examination will be <strong className="text-red-800 font-black">automatically submitted immediately</strong>.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-[#fffdf9] p-3 rounded-xl border-2 border-[#064E3B]/20">
                <Maximize2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#064E3B] font-black">Fullscreen Required:</strong> Upon clicking "Start Exam", your browser will enter Fullscreen mode. Exiting fullscreen mode during the exam triggers a security alert.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-[#fffdf9] p-3 rounded-xl border-2 border-[#064E3B]/20">
                <Eye className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#064E3B] font-black">Tab & Focus Monitoring:</strong> Switching tabs, minimizing the browser window, or losing window focus is continuously logged by the proctoring server.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-[#fffdf9] p-3 rounded-xl border-2 border-[#064E3B]/20">
                <CopyX className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#064E3B] font-black">Copy & Clipboard Prohibition:</strong> Text selection, right-clicking, copying, cutting, and pasting question text are strictly restricted.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-[#fffdf9] p-3 rounded-xl border-2 border-[#064E3B]/20">
                <Clock className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#064E3B] font-black">1-Minute Inactivity Abandonment Rule:</strong> The server continuously tracks your heartbeat. If the screen is closed or connection disappears for more than 60 seconds, your exam will be automatically submitted as abandoned.
                </div>
              </li>

              <li className="flex items-start space-x-3 bg-[#fffdf9] p-3 rounded-xl border-2 border-[#064E3B]/20">
                <CheckSquare className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#064E3B] font-black">MCQ Selection:</strong> For each question, select the correct option (A, B, C, D, etc.) and proceed to the next question.
                </div>
              </li>
            </ul>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-4 border-t-2 border-[#064E3B]/15">
            <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/25 hover:border-[#064E3B] transition-all">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#064E3B] text-[#064E3B] focus:ring-[#064E3B]"
              />
              <span className="text-xs font-black text-[#064E3B] leading-normal">
                I have read and understood all examination rules, anti-cheating requirements, and proctoring terms.
              </span>
            </label>
          </div>

          {/* Start Exam Button */}
          <button
            disabled={!agreed || starting}
            onClick={handleStartExam}
            className="w-full py-4 px-6 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-[#064E3B]/20 border-2 border-[#064E3B]"
          >
            <PlayCircle className="w-5 h-5" />
            <span>{starting ? 'INITIALIZING FULLSCREEN EXAM...' : 'START EXAM NOW'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
