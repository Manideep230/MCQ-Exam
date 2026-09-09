'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, BookOpen, Clock, CheckCircle2, Award, TrendingUp, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

interface StatsData {
  totalStudents: number;
  totalExams: number;
  scheduledExams: number;
  activeExams: number;
  completedExams: number;
  averageScore: number;
  highestScore: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed stats fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">ADMINISTRATOR CONTROL PANEL</h1>
          <p className="text-xs text-slate-400 mt-1">Overview of university students, exams, AI scoring metrics, and audit logs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/exams/create"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Requirement #8 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats?.totalStudents}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Total Exams</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats?.totalExams}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Scheduled</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats?.scheduledExams}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats?.completedExams}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{loading ? '...' : `${stats?.averageScore} / 30`}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Highest Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{loading ? '...' : `${stats?.highestScore} / 30`}</p>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/students"
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl space-y-4 group transition-all shadow-lg"
        >
          <div className="w-12 h-12 bg-blue-950 text-blue-400 rounded-xl flex items-center justify-center border border-blue-800/80">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Student Management</h3>
            <p className="text-xs text-slate-400 mt-1">Enroll new students with Roll Numbers & Temporary Passwords, reset access keys, and view history.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-400 pt-2">
            <span>Manage Records</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl space-y-4 group transition-all shadow-lg"
        >
          <div className="w-12 h-12 bg-purple-950 text-purple-400 rounded-xl flex items-center justify-center border border-purple-800/80">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">Question Bank</h3>
            <p className="text-xs text-slate-400 mt-1">Manage MCQ questions, set options A-D, configure authoritative correct options, and edit marks.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-400 pt-2">
            <span>Question Manager</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/results"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl space-y-4 group transition-all shadow-lg"
        >
          <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-800/80">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Results & Answer Sheets</h3>
            <p className="text-xs text-slate-400 mt-1">Inspect individual student answer sheets, AI justification evaluations, scores, and proctoring audit trails.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 pt-2">
            <span>View Submissions</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
