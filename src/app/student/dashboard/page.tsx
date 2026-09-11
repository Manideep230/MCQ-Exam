'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, Clock, Calendar, HelpCircle, Award, CheckCircle2, PlayCircle, Lock, AlertCircle } from 'lucide-react';

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
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    deadlineAt: string;
    submittedAt?: string;
    score?: number;
    totalMarks?: number;
    percentage?: number;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">AI EXAM PORTAL</h1>
              <p className="text-xs text-slate-400">Student Portal Dashboard</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Student Welcome Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">OFFICIAL STUDENT RECORD</span>
              <h2 className="text-2xl font-black text-white">
                Welcome, {user?.fullName || 'Student'}
              </h2>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-white font-mono font-semibold">{user?.rollNumber}</span>
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">BRANCH</span>
              <p className="text-sm font-bold text-slate-200 truncate">{user?.branch || '-'}</p>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">COLLEGE</span>
              <p className="text-sm font-bold text-slate-200 truncate">{user?.collegeName || '-'}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Exams Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 space-x-8 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'available' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Available Exams ({availableExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'upcoming' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Upcoming Exams ({upcomingExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'completed' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed / Expired ({completedExams.length})</span>
            </button>
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading examination schedules...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'available' && (
                availableExams.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400 text-sm">
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
                  <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400 text-sm">
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
                  <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400 text-sm">
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            exam.status === 'Available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
            exam.status === 'Upcoming' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
            exam.status === 'Completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
            exam.status === 'Disabled' ? 'bg-red-950 text-red-400 border border-red-800' :
            'bg-slate-800 text-slate-400'
          }`}>
            {exam.status}
          </span>
          <span className="text-xs font-mono text-slate-400 font-semibold">{exam.durationMinutes} mins</span>
        </div>

        <h3 className="text-lg font-bold text-white leading-snug">{exam.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2">{exam.description || 'No description provided.'}</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Questions:</span>
          </span>
          <span className="font-semibold text-white">{exam.questionCount} Questions</span>
        </div>

        {exam.status === 'Completed' && exam.attempt?.score !== undefined ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/80">
            <span className="flex items-center space-x-1.5 text-blue-300 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Your Score:</span>
            </span>
            <span className="font-mono text-sm font-black text-white">
              {exam.attempt.score} / {exam.attempt.totalMarks || exam.totalMarks} ({exam.attempt.percentage}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Marks:</span>
            </span>
            <span className="font-semibold text-white">{exam.totalMarks} Marks</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Window:</span>
          </span>
          <span className="font-mono text-[11px] text-slate-300">
            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="pt-2">
        {exam.status === 'Available' && (
          <button
            onClick={onStart}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{exam.attempt?.status === 'in_progress' ? 'RESUME EXAM' : 'START EXAM'}</span>
          </button>
        )}

        {exam.status === 'Upcoming' && (
          <div className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-semibold text-xs text-center flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>STARTS AT {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {(exam.status === 'Completed' || exam.status === 'Expired') && (
          <button
            onClick={onResult}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>VIEW EXAMINATION RESULT</span>
          </button>
        )}
      </div>
    </div>
  );
}
