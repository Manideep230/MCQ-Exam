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
    <div className="space-y-8 text-[#064E3B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#064E3B] tracking-tight">ADMINISTRATOR CONTROL PANEL</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Overview of university students, exams, AI scoring metrics, and audit logs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/exams/create"
            className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md border-2 border-[#064E3B]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* Requirement #8 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Total Students</span>
            <Users className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : stats?.totalStudents}</p>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Total Exams</span>
            <BookOpen className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : stats?.totalExams}</p>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Scheduled</span>
            <Clock className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : stats?.scheduledExams}</p>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : stats?.completedExams}</p>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Average Score</span>
            <TrendingUp className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : `${stats?.averageScore} / 30`}</p>
        </div>

        <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#064E3B]/70 font-bold">
            <span className="text-[10px] font-black uppercase">Highest Score</span>
            <Award className="w-4 h-4 text-[#064E3B]" />
          </div>
          <p className="text-2xl font-black text-[#064E3B]">{loading ? '...' : `${stats?.highestScore} / 30`}</p>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/students"
          className="bg-[#faedd7] border-2 border-[#064E3B]/25 hover:border-[#064E3B] p-6 rounded-2xl space-y-4 group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-[#064E3B] text-[#f8e7c9] rounded-xl flex items-center justify-center border border-[#064E3B]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#064E3B] group-hover:text-[#04382b] transition-colors">Student Management</h3>
            <p className="text-xs text-[#064E3B]/80 mt-1 font-medium">Enroll new students with Roll Numbers & Temporary Passwords, reset access keys, and view history.</p>
          </div>
          <div className="flex items-center text-xs font-black text-[#064E3B] pt-2">
            <span>Manage Records</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-[#faedd7] border-2 border-[#064E3B]/25 hover:border-[#064E3B] p-6 rounded-2xl space-y-4 group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-[#064E3B] text-[#f8e7c9] rounded-xl flex items-center justify-center border border-[#064E3B]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#064E3B] group-hover:text-[#04382b] transition-colors">Question Bank</h3>
            <p className="text-xs text-[#064E3B]/80 mt-1 font-medium">Manage MCQ questions, set options A-H, configure authoritative correct options, and edit marks.</p>
          </div>
          <div className="flex items-center text-xs font-black text-[#064E3B] pt-2">
            <span>Question Manager</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/results"
          className="bg-[#faedd7] border-2 border-[#064E3B]/25 hover:border-[#064E3B] p-6 rounded-2xl space-y-4 group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-[#064E3B] text-[#f8e7c9] rounded-xl flex items-center justify-center border border-[#064E3B]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#064E3B] group-hover:text-[#04382b] transition-colors">Results & Answer Sheets</h3>
            <p className="text-xs text-[#064E3B]/80 mt-1 font-medium">Inspect individual student answer sheets, score evaluations, and proctoring audit trails.</p>
          </div>
          <div className="flex items-center text-xs font-black text-[#064E3B] pt-2">
            <span>View Submissions</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
