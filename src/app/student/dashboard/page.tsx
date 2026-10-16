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
    attemptId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
  };
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StudentUser | null>(null);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'upcoming' | 'completed'>('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/student/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load dashboard data');
      }
      const data = await res.json();
      setUser(data.user);
      setExams(data.exams || []);
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
    <div className="min-h-screen bg-[#021f18] text-[#faeed9] flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#03261d]/95 backdrop-blur-md border-b border-[#064E3B] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B] border border-[#f8e7c9]/30 flex items-center justify-center shadow-lg shadow-[#064E3B]/40">
              <GraduationCap className="w-6 h-6 text-[#f8e7c9]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#f8e7c9] tracking-wide">AI EXAM PORTAL</h1>
              <p className="text-xs text-[#c7b89f]">Student Portal Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/student/feedback"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#085a44] text-[#f8e7c9] text-xs font-bold border border-[#f8e7c9]/30 transition-all shadow-md shadow-[#064E3B]/30"
            >
              <MessageSquare className="w-4 h-4 text-[#f8e7c9]" />
              <span>Training Feedback</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#021f18] hover:bg-[#03261d] text-[#faeed9] text-xs font-semibold border border-[#064E3B] transition-all"
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
        <div className="bg-gradient-to-r from-[#064E3B] via-[#04382b] to-[#022c22] border border-[#f8e7c9]/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-bold text-[#f8e7c9] uppercase tracking-widest">OFFICIAL STUDENT RECORD</span>
              <h2 className="text-2xl font-black text-[#f8e7c9]">
                Welcome, {user?.fullName || 'Student'}
              </h2>
              <p className="text-xs text-[#faeed9]">
                Logged in as <span className="text-[#f8e7c9] font-mono font-semibold">{user?.rollNumber}</span>
              </p>
            </div>

            <div className="bg-[#021f18]/80 rounded-xl p-3.5 border border-[#064E3B] space-y-1">
              <span className="text-[10px] font-semibold text-[#c7b89f] uppercase">BRANCH</span>
              <p className="text-sm font-bold text-[#f8e7c9] truncate">{user?.branch || '-'}</p>
            </div>

            <div className="bg-[#021f18]/80 rounded-xl p-3.5 border border-[#064E3B] space-y-1">
              <span className="text-[10px] font-semibold text-[#c7b89f] uppercase">COLLEGE</span>
              <p className="text-sm font-bold text-[#f8e7c9] truncate">{user?.collegeName || '-'}</p>
            </div>
          </div>
        </div>

        {/* FSI Training Feedback Action Banner */}
        <div className="bg-gradient-to-r from-[#03261d] via-[#04382b] to-[#064E3B] border border-[#f8e7c9]/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f8e7c9]/15 text-[#f8e7c9] border border-[#f8e7c9]/30 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#f8e7c9]" />
                <span>STUDENT ACTION REQUIRED</span>
              </span>
              <span className="text-xs text-[#faeed9] font-semibold">GMRIT — Final Year (ECE & EEE)</span>
            </div>
            <h3 className="text-lg font-bold text-[#f8e7c9] tracking-wide">
              FSI Technical Training — Student Feedback Form
            </h3>
            <p className="text-xs text-[#faeed9]/90 max-w-2xl leading-relaxed">
              Please provide your honest evaluation regarding training methodology, technical domains (IoT, IIoT, MongoDB, Python, Edge AI, Neural Networks), and project planning.
            </p>
          </div>

          <Link
            href="/student/feedback"
            className="px-5 py-3 rounded-xl bg-[#f8e7c9] hover:bg-[#faeed9] text-[#064E3B] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-[#f8e7c9]/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Feedback Form</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Exams Section */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#064E3B] space-x-8 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'available' ? 'text-[#f8e7c9] border-b-2 border-[#f8e7c9] font-bold' : 'text-[#c7b89f] hover:text-[#f8e7c9]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Available Exams ({availableExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'upcoming' ? 'text-[#f8e7c9] border-b-2 border-[#f8e7c9] font-bold' : 'text-[#c7b89f] hover:text-[#f8e7c9]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Upcoming Exams ({upcomingExams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 flex items-center space-x-2 transition-all relative ${
                activeTab === 'completed' ? 'text-[#f8e7c9] border-b-2 border-[#f8e7c9] font-bold' : 'text-[#c7b89f] hover:text-[#f8e7c9]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed / Expired ({completedExams.length})</span>
            </button>
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="py-12 text-center text-[#c7b89f] text-sm">Loading examination schedules...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'available' && (
                availableExams.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-[#03261d]/60 rounded-2xl border border-[#064E3B] text-[#faeed9] text-sm">
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
                  <div className="col-span-full py-12 text-center bg-[#03261d]/60 rounded-2xl border border-[#064E3B] text-[#faeed9] text-sm">
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
                  <div className="col-span-full py-12 text-center bg-[#03261d]/60 rounded-2xl border border-[#064E3B] text-[#faeed9] text-sm">
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
    <div className="bg-[#03261d] border border-[#064E3B] rounded-2xl p-6 space-y-5 flex flex-col justify-between hover:border-[#f8e7c9]/40 transition-all shadow-xl">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            exam.status === 'Available' ? 'bg-[#064E3B] text-[#f8e7c9] border border-[#f8e7c9]/30' :
            exam.status === 'Upcoming' ? 'bg-[#e3b970]/20 text-[#eed19c] border border-[#e3b970]/40' :
            exam.status === 'Completed' ? 'bg-[#064E3B]/60 text-[#34d399] border border-[#064E3B]' :
            exam.status === 'Disabled' ? 'bg-red-950 text-red-400 border border-red-800' :
            'bg-[#021f18] text-[#c7b89f]'
          }`}>
            {exam.status}
          </span>
          <span className="text-xs font-mono text-[#c7b89f] font-semibold">{exam.durationMinutes} mins</span>
        </div>

        <h3 className="text-lg font-bold text-[#f8e7c9] leading-snug">{exam.title}</h3>
        <p className="text-xs text-[#faeed9]/80 line-clamp-2">{exam.description || 'No description provided.'}</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-[#064E3B]/80 text-xs text-[#faeed9]">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-[#c7b89f]">
            <HelpCircle className="w-3.5 h-3.5 text-[#f8e7c9]" />
            <span>Questions:</span>
          </span>
          <span className="font-semibold text-[#f8e7c9]">{exam.questionCount} Questions</span>
        </div>

        {exam.status === 'Completed' && exam.attempt?.score !== undefined ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#021f18] border border-[#064E3B]">
            <span className="flex items-center space-x-1.5 text-[#f8e7c9] font-bold">
              <Award className="w-4 h-4 text-[#f8e7c9]" />
              <span>Your Score:</span>
            </span>
            <span className="font-mono text-sm font-black text-[#f8e7c9]">
              {exam.attempt.score} / {exam.attempt.totalMarks || exam.totalMarks} ({exam.attempt.percentage}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#c7b89f]">
              <Award className="w-3.5 h-3.5 text-[#f8e7c9]" />
              <span>Total Marks:</span>
            </span>
            <span className="font-semibold text-[#f8e7c9]">{exam.totalMarks} Marks</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-[#c7b89f]">
            <Calendar className="w-3.5 h-3.5 text-[#f8e7c9]" />
            <span>Window:</span>
          </span>
          <span className="font-mono text-[11px] text-[#faeed9]">
            {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="pt-2">
        {exam.status === 'Available' && onStart && (
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-xl bg-[#f8e7c9] hover:bg-[#faeed9] text-[#064E3B] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#f8e7c9]/20 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Begin Examination</span>
          </button>
        )}

        {exam.status === 'Completed' && onResult && (
          <button
            onClick={onResult}
            className="w-full py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#085a44] text-[#f8e7c9] font-bold text-xs uppercase tracking-wider border border-[#f8e7c9]/30 flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <Award className="w-4 h-4 text-[#f8e7c9]" />
            <span>View Performance Result</span>
          </button>
        )}

        {exam.status === 'Upcoming' && (
          <div className="w-full py-2.5 rounded-xl bg-[#021f18] text-[#c7b89f] font-semibold text-xs border border-[#064E3B] flex items-center justify-center space-x-2 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <span>Examination Locked</span>
          </div>
        )}

        {exam.status === 'Expired' && (
          <div className="w-full py-2.5 rounded-xl bg-[#021f18] text-[#c7b89f] font-semibold text-xs border border-[#064E3B] flex items-center justify-center space-x-2 cursor-not-allowed">
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule Expired</span>
          </div>
        )}
      </div>
    </div>
  );
}
