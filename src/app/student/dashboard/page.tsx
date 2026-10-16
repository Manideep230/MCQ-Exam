'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, LogOut, Clock, Calendar, HelpCircle, Award, CheckCircle2, PlayCircle, Lock, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';

interface StudentUser {
  id: string;
  rollNumber: string;
  fullName: string;
  branch: string;
  collegeName: string;
}

interface ExamItem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  startAt: string;
  endAt: string;
  status: 'Upcoming' | 'Available' | 'Completed' | 'Expired' | 'Disabled';
  attempt?: {
    attemptId?: string;
    id?: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
  } | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<StudentUser | null>(null);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'upcoming' | 'completed'>('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dashRes = await fetch('/api/student/dashboard');
      if (dashRes.ok) {
        const data = await dashRes.json();
        setUser(data.user);
        setExams(data.exams || []);
      } else {
        const [meRes, examsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/student/exams'),
        ]);

        if (!meRes.ok || !examsRes.ok) {
          throw new Error('Failed to load portal session data');
        }

        const meData = await meRes.json();
        const examsData = await examsRes.json();

        setUser(meData.user);
        setExams(examsData.exams || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const availableExams = exams.filter(e => e.status === 'Available');
  const upcomingExams = exams.filter(e => e.status === 'Upcoming');
  const completedExams = exams.filter(e => e.status === 'Completed' || e.status === 'Expired');

  return (
    <div className="min-h-screen bg-[#f8e7c9] text-[#064E3B] flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#f8e7c9]/95 backdrop-blur-md border-b border-[#064E3B]/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B] flex items-center justify-center shadow-md shadow-[#064E3B]/20">
              <GraduationCap className="w-6 h-6 text-[#f8e7c9]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#064E3B] tracking-wide">AI EXAM PORTAL</h1>
              <p className="text-xs text-[#064E3B]/80 font-medium">Student Portal Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/student/feedback"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#f8e7c9]" />
              <span>Training Feedback</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#faedd7] hover:bg-[#f3deba] text-[#064E3B] text-xs font-bold border border-[#064E3B]/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Student Welcome Header Card */}
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-bold text-[#064E3B] uppercase tracking-widest">OFFICIAL STUDENT RECORD</span>
              <h2 className="text-2xl font-black text-[#064E3B]">
                Welcome, {user?.fullName || 'Student'}
              </h2>
              <p className="text-xs text-[#064E3B]/80 font-medium">
                Logged in as <span className="text-[#064E3B] font-mono font-bold">{user?.rollNumber}</span>
              </p>
            </div>

            <div className="bg-[#fffdf9] rounded-xl p-3.5 border border-[#064E3B]/25 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#064E3B]/70 uppercase">BRANCH</span>
              <p className="text-sm font-bold text-[#064E3B] truncate">{user?.branch || '-'}</p>
            </div>

            <div className="bg-[#fffdf9] rounded-xl p-3.5 border border-[#064E3B]/25 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#064E3B]/70 uppercase">COLLEGE</span>
              <p className="text-sm font-bold text-[#064E3B] truncate">{user?.collegeName || '-'}</p>
            </div>
          </div>
        </div>

        {/* FSI Training Feedback Action Banner */}
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#064E3B] text-[#f8e7c9] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#f8e7c9]" />
                <span>STUDENT ACTION REQUIRED</span>
              </span>
              <span className="text-xs text-[#064E3B] font-bold">GMRIT — Final Year (ECE & EEE)</span>
            </div>
            <h3 className="text-lg font-black text-[#064E3B] tracking-wide">
              FSI Technical Training — Student Feedback Form
            </h3>
            <p className="text-xs text-[#064E3B]/80 max-w-2xl leading-relaxed font-medium">
              Please provide your honest evaluation regarding training methodology, technical domains (IoT, IIoT, MongoDB, Python, Edge AI, Neural Networks), and project planning.
            </p>
          </div>

          <Link
            href="/student/feedback"
            className="px-5 py-3 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-[#064E3B]/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Feedback Form</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Exams Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b-2 border-[#064E3B]/20 space-x-8 text-sm font-bold">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'available' ? 'text-[#064E3B] border-b-2 border-[#064E3B] font-black' : 'text-[#064E3B]/60 hover:text-[#064E3B]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Available Exams ({availableExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'upcoming' ? 'text-[#064E3B] border-b-2 border-[#064E3B] font-black' : 'text-[#064E3B]/60 hover:text-[#064E3B]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Upcoming Exams ({upcomingExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'completed' ? 'text-[#064E3B] border-b-2 border-[#064E3B] font-black' : 'text-[#064E3B]/60 hover:text-[#064E3B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed / Expired ({completedExams.length})</span>
            </button>
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="py-12 text-center text-[#064E3B]/70 font-semibold text-sm">Loading examination schedules...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'available' && (
                availableExams.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-[#faedd7] rounded-2xl border border-[#064E3B]/20 text-[#064E3B] font-medium text-sm">
                    No active examinations available right now.
                  </div>
                ) : (
                  availableExams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} onStart={() => router.push(`/student/exam/${exam.id}/instructions`)} />
                  ))
                )
              )}

              {activeTab === 'upcoming' && (
                upcomingExams.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-[#faedd7] rounded-2xl border border-[#064E3B]/20 text-[#064E3B] font-medium text-sm">
                    No upcoming examinations scheduled.
                  </div>
                ) : (
                  upcomingExams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))
                )
              )}

              {activeTab === 'completed' && (
                completedExams.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-[#faedd7] rounded-2xl border border-[#064E3B]/20 text-[#064E3B] font-medium text-sm">
                    No completed examinations recorded yet.
                  </div>
                ) : (
                  completedExams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} onResult={() => router.push(`/student/exam/${exam.id}/result`)} />
                  ))
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ExamCard({ exam, onStart, onResult }: { exam: ExamItem; onStart?: () => void; onResult?: () => void }) {
  const startDate = new Date(exam.startAt);
  const endDate = new Date(exam.endAt);

  return (
    <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 space-y-5 flex flex-col justify-between hover:border-[#064E3B]/50 transition-all shadow-xl">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            exam.status === 'Available' ? 'bg-[#064E3B] text-[#f8e7c9]' :
            exam.status === 'Upcoming' ? 'bg-amber-600 text-white' :
            exam.status === 'Completed' ? 'bg-[#047857] text-white' :
            exam.status === 'Disabled' ? 'bg-red-700 text-white' :
            'bg-[#d4b98c] text-[#064E3B]'
          }`}>
            {exam.status}
          </span>
          <span className="text-xs font-mono text-[#064E3B] font-bold">{exam.durationMinutes} mins</span>
        </div>

        <h3 className="text-lg font-black text-[#064E3B] leading-snug">{exam.title}</h3>
        <p className="text-xs text-[#064E3B]/80 font-medium line-clamp-2">{exam.description || 'No description provided.'}</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-[#064E3B]/20 text-xs text-[#064E3B]">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-[#064E3B]/70 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Questions:</span>
          </span>
          <span className="font-extrabold text-[#064E3B]">{exam.questionCount} Questions</span>
        </div>

        {exam.status === 'Completed' && exam.attempt?.score !== undefined ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fffdf9] border border-[#064E3B]/30">
            <span className="flex items-center space-x-1.5 text-[#064E3B] font-extrabold">
              <Award className="w-4 h-4 text-[#064E3B]" />
              <span>Your Score:</span>
            </span>
            <span className="font-mono text-sm font-black text-[#064E3B]">
              {exam.attempt.score} / {exam.attempt.totalMarks || exam.totalMarks} ({exam.attempt.percentage}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#064E3B]/70 font-semibold">
              <Award className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Total Marks:</span>
            </span>
            <span className="font-extrabold text-[#064E3B]">{exam.totalMarks} Marks</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-[#064E3B]/70 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Window:</span>
          </span>
          <span className="font-mono text-[11px] text-[#064E3B] font-semibold">
            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="pt-2">
        {exam.status === 'Available' && (
          <button
            onClick={onStart}
            className="w-full py-3 px-4 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#064E3B]/20"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{exam.attempt?.status === 'in_progress' ? 'RESUME EXAM' : 'START EXAM'}</span>
          </button>
        )}

        {exam.status === 'Upcoming' && (
          <div className="w-full py-3 px-4 rounded-xl bg-[#fffdf9] border border-[#064E3B]/30 text-[#064E3B]/70 font-bold text-xs text-center flex items-center justify-center space-x-2">
            <Lock className="w-3.5 h-3.5" />
            <span>STARTS AT {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {(exam.status === 'Completed' || exam.status === 'Expired') && (
          <button
            onClick={onResult}
            className="w-full py-3 px-4 rounded-xl bg-[#faedd7] hover:bg-[#f3deba] text-[#064E3B] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-2 border-[#064E3B]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
            <span>VIEW EXAMINATION RESULT</span>
          </button>
        )}
      </div>
    </div>
  );
}
